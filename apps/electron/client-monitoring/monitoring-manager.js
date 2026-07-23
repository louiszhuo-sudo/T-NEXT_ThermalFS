const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { requestJson } = require('./http-client');
const {
  DEFAULT_MONITORING_CONFIG,
  createBatchPayload,
  createId,
  createTelemetryEvent,
  createTelemetrySample,
  mergeMonitoringConfig,
  mergeMonitoringState,
  nowIso,
} = require('../shared/telemetry-contracts');

class MonitoringManager {
  constructor(options = {}) {
    this.getMainWindow = options.getMainWindow || (() => null);
    this.onStateChange = options.onStateChange || (() => {});
    this.monitoringRoot = path.join(app.getPath('userData'), 'monitoring');
    this.spoolDir = path.join(this.monitoringRoot, 'spool');
    this.configPath = path.join(this.monitoringRoot, 'monitoring-config.json');
    this.statePath = path.join(this.monitoringRoot, 'state.json');

    this.config = mergeMonitoringConfig(DEFAULT_MONITORING_CONFIG, {
      clientName: app.getName(),
    });
    this.state = mergeMonitoringState();
    this.pendingSamples = [];
    this.pendingEvents = [];
    this.sampleTimer = null;
    this.flushTimer = null;
    this.uploadTimer = null;
    this.uploadRetryIndex = 0;
    this.isUploading = false;
  }

  async init() {
    fs.mkdirSync(this.spoolDir, { recursive: true });
    this.config = this.loadJson(this.configPath, this.config);

    if (!this.config.clientId) {
      this.config.clientId = createId('client');
      this.saveConfig();
    }

    this.state = this.loadJson(this.statePath, this.state);
    const spoolFiles = this.getSpoolFiles();

    if (this.state.currentSessionId && spoolFiles.length > 0) {
      this.recordEvent('session-resume', 'Recovered pending monitoring batches after restart.', {
        pendingBatches: spoolFiles.length,
        sessionId: this.state.currentSessionId,
      });
    } else {
      this.state.currentSessionId = this.state.currentSessionId || createId('session');
      this.recordEvent('app-start', 'Monitoring session started.', {
        sessionId: this.state.currentSessionId,
      });
    }

    this.persistState();
    this.startTimers();
    this.scheduleUpload(250);
    this.emitState();
  }

  shutdown() {
    clearInterval(this.sampleTimer);
    clearInterval(this.flushTimer);
    clearTimeout(this.uploadTimer);
    this.sampleTimer = null;
    this.flushTimer = null;
    this.uploadTimer = null;
    this.flushPendingBatch('shutdown');
    this.persistState();
  }

  getSnapshot() {
    const spoolFiles = this.getSpoolFiles();
    const totalBytes = spoolFiles.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);

    return {
      config: this.config,
      state: this.state,
      sessionId: this.state.currentSessionId,
      clientId: this.config.clientId,
      isUploading: this.isUploading,
      pendingSamples: this.pendingSamples.length,
      pendingEvents: this.pendingEvents.length,
      pendingBatches: spoolFiles.length,
      pendingBytes: totalBytes,
      lastUploadAt: this.state.lastUploadAt,
      lastError: this.state.lastError,
      pauseRecording: this.config.pauseRecording,
      pauseUpload: this.config.pauseUpload,
    };
  }

  startTimers() {
    clearInterval(this.sampleTimer);
    clearInterval(this.flushTimer);

    this.sampleTimer = setInterval(() => {
      this.collectSample().catch((error) => {
        this.state.lastError = `Sample collection failed: ${error.message}`;
        this.persistState();
        this.emitState();
      });
    }, this.config.sampleIntervalMs);

    this.flushTimer = setInterval(() => {
      this.flushPendingBatch('interval');
    }, this.config.batchFlushIntervalMs);
  }

  loadJson(filePath, fallbackValue) {
    if (!fs.existsSync(filePath)) {
      return fallbackValue;
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (filePath === this.configPath) {
        return mergeMonitoringConfig(fallbackValue, parsed);
      }

      return mergeMonitoringState(fallbackValue, parsed);
    } catch (error) {
      console.error(`Failed to read ${filePath}:`, error);
      return fallbackValue;
    }
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
  }

  persistState() {
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  emitState() {
    this.onStateChange(this.getSnapshot());
  }

  recordEvent(type, message, meta = {}) {
    if (this.config.pauseRecording) {
      return;
    }

    this.pendingEvents.push(createTelemetryEvent(type, message, meta));
    this.emitState();
  }

  async collectSample() {
    if (this.config.pauseRecording) {
      return;
    }

    const appMetrics = app.getAppMetrics();
    const cpuPercentTotal = Number(
      appMetrics.reduce((sum, metric) => sum + Number(metric.cpu?.percent || 0), 0).toFixed(2),
    );
    const ramWorkingSetBytesTotal = appMetrics.reduce(
      (sum, metric) => sum + Number(metric.memory?.workingSetSize || 0),
      0,
    );
    const domMetrics = await this.getRendererMetrics();

    this.pendingSamples.push(createTelemetrySample({
      cpuPercentTotal,
      ramWorkingSetBytesTotal,
      domNodeCount: domMetrics.domNodeCount,
      jsHeapUsedBytes: domMetrics.jsHeapUsedBytes,
      jsHeapTotalBytes: domMetrics.jsHeapTotalBytes,
      pageUrl: domMetrics.pageUrl,
      windowTitle: domMetrics.windowTitle,
    }));

    if (this.pendingSamples.length >= this.config.batchMaxSamples) {
      this.flushPendingBatch('threshold');
    }

    this.emitState();
  }

  async getRendererMetrics() {
    const mainWindow = this.getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) {
      return {
        domNodeCount: null,
        jsHeapUsedBytes: null,
        jsHeapTotalBytes: null,
        pageUrl: '',
        windowTitle: '',
      };
    }

    try {
      return await mainWindow.webContents.executeJavaScript(`
        (() => {
          const perf = performance && performance.memory ? performance.memory : {};
          return {
            domNodeCount: document.getElementsByTagName('*').length,
            pageUrl: window.location.href,
            windowTitle: document.title || '',
            jsHeapUsedBytes: Number.isFinite(perf.usedJSHeapSize) ? perf.usedJSHeapSize : null,
            jsHeapTotalBytes: Number.isFinite(perf.totalJSHeapSize) ? perf.totalJSHeapSize : null
          };
        })()
      `, true);
    } catch (error) {
      return {
        domNodeCount: null,
        jsHeapUsedBytes: null,
        jsHeapTotalBytes: null,
        pageUrl: '',
        windowTitle: '',
      };
    }
  }

  flushPendingBatch(reason = 'manual') {
    if (this.pendingSamples.length === 0 && this.pendingEvents.length === 0) {
      return;
    }

    this.trimSpoolIfNeeded();
    const sequence = Number(this.state.nextSequence || 1);
    const batchId = createId('batch');
    const batch = createBatchPayload({
      clientId: this.config.clientId,
      clientName: this.config.clientName,
      appVersion: app.getVersion(),
      platform: process.platform,
      libraryId: this.config.libraryId,
      sessionId: this.state.currentSessionId,
      batchId,
      sequence,
      createdAt: nowIso(),
      samples: [...this.pendingSamples],
      events: [...this.pendingEvents],
    });

    const spoolPath = path.join(this.spoolDir, `${String(sequence).padStart(8, '0')}_${batchId}.json`);
    fs.writeFileSync(spoolPath, JSON.stringify(batch, null, 2), 'utf8');

    this.pendingSamples = [];
    this.pendingEvents = [];
    this.state.nextSequence = sequence + 1;
    this.persistState();
    this.recordEvent('batch-enqueued', 'Telemetry batch written to local spool.', {
      batchId,
      sequence,
      reason,
      spoolPath: path.basename(spoolPath),
    });

    if (!this.config.pauseUpload) {
      this.scheduleUpload(100);
    }
  }

  trimSpoolIfNeeded() {
    const spoolFiles = this.getSpoolFiles();
    let totalBytes = spoolFiles.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);

    for (const filePath of spoolFiles) {
      if (totalBytes < this.config.maxSpoolBytes) {
        break;
      }

      try {
        const size = fs.statSync(filePath).size;
        fs.unlinkSync(filePath);
        totalBytes -= size;
        this.state.lastError = `Spool limit reached, trimmed oldest batch ${path.basename(filePath)}.`;
      } catch (error) {
        this.state.lastError = `Failed to trim spool file ${path.basename(filePath)}: ${error.message}`;
      }
    }
  }

  getSpoolFiles() {
    if (!fs.existsSync(this.spoolDir)) {
      return [];
    }

    return fs.readdirSync(this.spoolDir)
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => path.join(this.spoolDir, fileName))
      .sort();
  }

  async uploadNextBatch() {
    if (this.isUploading || this.config.pauseUpload) {
      return;
    }
    return this.uploadNextBatchCore();
  }

  async uploadNextBatchCore() {
    if (this.isUploading) {
      return false;
    }

    const spoolFiles = this.getSpoolFiles();
    if (spoolFiles.length === 0) {
      this.emitState();
      return false;
    }

    this.isUploading = true;
    const batchPath = spoolFiles[0];
    let uploaded = false;

    try {
      const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
      const response = await requestJson('POST', `${this.config.remoteUrl}/api/ingest/batches`, batch, 8000);

      if (response.statusCode >= 200 && response.statusCode < 300 && response.body?.accepted) {
        fs.unlinkSync(batchPath);
        this.state.lastAckSequence = batch.sequence;
        this.state.lastUploadAt = response.body.receivedAt || nowIso();
        this.state.lastError = '';
        this.uploadRetryIndex = 0;
        this.recordEvent('batch-upload-succeeded', 'Telemetry batch uploaded.', {
          batchId: batch.batchId,
          sequence: batch.sequence,
        });
        uploaded = true;
      } else {
        const errorMessage = response.body?.error || `HTTP ${response.statusCode}`;
        this.state.lastError = `Upload rejected: ${errorMessage}`;
        this.recordEvent('batch-upload-failed', 'Telemetry batch upload failed.', {
          batchId: batch.batchId,
          sequence: batch.sequence,
          statusCode: response.statusCode,
          error: errorMessage,
        });
        this.scheduleUpload(this.nextRetryDelay());
      }
    } catch (error) {
      this.state.lastError = `Upload failed: ${error.message}`;
      this.recordEvent('batch-upload-failed', 'Telemetry batch upload failed.', {
        error: error.message,
        batchPath: path.basename(batchPath),
      });
      this.scheduleUpload(this.nextRetryDelay());
    } finally {
      this.isUploading = false;
      this.persistState();
      this.emitState();
    }

    if (!this.config.pauseUpload && this.getSpoolFiles().length > 0 && !this.uploadTimer) {
      this.scheduleUpload(250);
    }

    return uploaded;
  }

  nextRetryDelay() {
    const delays = this.config.retryBackoffMs || DEFAULT_MONITORING_CONFIG.retryBackoffMs;
    const delay = delays[Math.min(this.uploadRetryIndex, delays.length - 1)];
    this.uploadRetryIndex += 1;
    return delay;
  }

  scheduleUpload(delayMs = 0) {
    clearTimeout(this.uploadTimer);
    this.uploadTimer = setTimeout(() => {
      this.uploadTimer = null;
      this.uploadNextBatch().catch((error) => {
        console.error('Monitoring upload failed:', error);
      });
    }, delayMs);
  }

  async updateConfig(patch = {}) {
    this.config = mergeMonitoringConfig(this.config, patch);
    this.saveConfig();
    this.persistState();
    this.emitState();
    return this.getSnapshot();
  }

  async setPauseRecording(paused) {
    await this.updateConfig({ pauseRecording: Boolean(paused) });
    this.recordEvent(
      paused ? 'pause-recording' : 'resume-recording',
      paused ? 'Recording paused from monitoring control panel.' : 'Recording resumed from monitoring control panel.',
      { paused: Boolean(paused) },
    );
    return this.getSnapshot();
  }

  async setPauseUpload(paused) {
    await this.updateConfig({ pauseUpload: Boolean(paused) });
    this.recordEvent(
      paused ? 'pause-upload' : 'resume-upload',
      paused ? 'Upload paused from monitoring control panel.' : 'Upload resumed from monitoring control panel.',
      { paused: Boolean(paused) },
    );
    if (!paused) {
      this.scheduleUpload(100);
    }
    return this.getSnapshot();
  }

  async testConnection(remoteUrl = this.config.remoteUrl) {
    const response = await requestJson('GET', `${remoteUrl}/api/health`, null, 4000);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(response.body?.error || `HTTP ${response.statusCode}`);
    }

    return response.body;
  }

  async fetchLibraries(remoteUrl = this.config.remoteUrl) {
    const response = await requestJson('GET', `${remoteUrl}/api/libraries`, null, 5000);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(response.body?.error || `HTTP ${response.statusCode}`);
    }

    return response.body?.libraries || [];
  }

  async createRemoteLibrary(name, remoteUrl = this.config.remoteUrl) {
    const response = await requestJson('POST', `${remoteUrl}/api/libraries`, {
      name,
    }, 5000);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(response.body?.error || `HTTP ${response.statusCode}`);
    }

    return response.body?.library;
  }

  async manualSendAll() {
    this.flushPendingBatch('manual-send');
    this.state.lastError = '';
    this.persistState();
    this.emitState();

    let sentCount = 0;
    while (this.getSpoolFiles().length > 0) {
      const uploaded = await this.uploadNextBatchCore();
      if (!uploaded) {
        break;
      }
      sentCount += 1;
    }

    return {
      ...this.getSnapshot(),
      manualSendCount: sentCount,
      manualSendMessage: sentCount > 0
        ? `已手動送出 ${sentCount} 個批次。`
        : this.getSpoolFiles().length > 0
          ? '手動傳送中斷，仍有批次待送。'
          : '目前沒有待送批次。',
    };
  }
}

module.exports = {
  MonitoringManager,
};
