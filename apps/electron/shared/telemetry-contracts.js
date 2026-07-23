const crypto = require('crypto');

const DEFAULT_MONITORING_CONFIG = {
  clientId: '',
  clientName: 'Electron Client',
  remoteUrl: 'http://127.0.0.1:43127',
  libraryId: '',
  libraryName: '',
  pauseRecording: true,
  pauseUpload: true,
  sampleIntervalMs: 1000,
  batchFlushIntervalMs: 10000,
  batchMaxSamples: 10,
  retryBackoffMs: [3000, 10000, 30000],
  maxSpoolBytes: 100 * 1024 * 1024,
};

const DEFAULT_MONITORING_STATE = {
  currentSessionId: '',
  nextSequence: 1,
  lastAckSequence: 0,
  lastUploadAt: '',
  lastError: '',
};

function createId(prefix = 'id') {
  if (crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeRemoteUrl(remoteUrl) {
  const rawValue = String(remoteUrl || '').trim();
  if (!rawValue) {
    return DEFAULT_MONITORING_CONFIG.remoteUrl;
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue.replace(/\/+$/, '');
  }

  return `http://${rawValue.replace(/\/+$/, '')}`;
}

function createTelemetrySample(overrides = {}) {
  return {
    ts: overrides.ts || nowIso(),
    cpuPercentTotal: Number(overrides.cpuPercentTotal || 0),
    ramWorkingSetBytesTotal: Number(overrides.ramWorkingSetBytesTotal || 0),
    domNodeCount: overrides.domNodeCount == null ? null : Number(overrides.domNodeCount),
    jsHeapUsedBytes: overrides.jsHeapUsedBytes == null ? null : Number(overrides.jsHeapUsedBytes),
    jsHeapTotalBytes: overrides.jsHeapTotalBytes == null ? null : Number(overrides.jsHeapTotalBytes),
    pageUrl: overrides.pageUrl || '',
    windowTitle: overrides.windowTitle || '',
  };
}

function createTelemetryEvent(type, message = '', meta = {}, overrides = {}) {
  return {
    ts: overrides.ts || nowIso(),
    type,
    message,
    meta: meta || {},
  };
}

function createBatchPayload(overrides = {}) {
  return {
    clientId: overrides.clientId || '',
    clientName: overrides.clientName || '',
    appVersion: overrides.appVersion || '',
    platform: overrides.platform || process.platform,
    libraryId: overrides.libraryId || '',
    sessionId: overrides.sessionId || '',
    batchId: overrides.batchId || createId('batch'),
    sequence: Number(overrides.sequence || 1),
    createdAt: overrides.createdAt || nowIso(),
    samples: Array.isArray(overrides.samples) ? overrides.samples : [],
    events: Array.isArray(overrides.events) ? overrides.events : [],
  };
}

function mergeMonitoringConfig(baseConfig = {}, patch = {}) {
  return {
    ...DEFAULT_MONITORING_CONFIG,
    ...baseConfig,
    ...patch,
    remoteUrl: normalizeRemoteUrl((patch.remoteUrl !== undefined ? patch.remoteUrl : baseConfig.remoteUrl)),
    retryBackoffMs: Array.isArray(patch.retryBackoffMs)
      ? patch.retryBackoffMs
      : Array.isArray(baseConfig.retryBackoffMs)
        ? baseConfig.retryBackoffMs
        : DEFAULT_MONITORING_CONFIG.retryBackoffMs,
  };
}

function mergeMonitoringState(baseState = {}, patch = {}) {
  return {
    ...DEFAULT_MONITORING_STATE,
    ...baseState,
    ...patch,
  };
}

module.exports = {
  DEFAULT_MONITORING_CONFIG,
  DEFAULT_MONITORING_STATE,
  createBatchPayload,
  createId,
  createTelemetryEvent,
  createTelemetrySample,
  mergeMonitoringConfig,
  mergeMonitoringState,
  normalizeRemoteUrl,
  nowIso,
};
