const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const { spawn } = require('child_process');

const DEFAULT_DEV_URL = 'http://127.0.0.1:3000';
const DEFAULT_PROD_PORTS = [3000];
const DEFAULT_LOCAL_HOST = '127.0.0.1';
const DEFAULT_LAN_BIND_HOST = '0.0.0.0';
const DEFAULT_NETWORK_MODE = 'lan';
const DEFAULT_START_TIMEOUT_MS = 30000;

function getTransport(urlString) {
  const protocol = new URL(urlString).protocol;
  return protocol === 'https:' ? https : http;
}

function probeHealthUrl(urlString, timeoutMs = 1500) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    let request;
    try {
      request = getTransport(urlString).get(urlString, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          if (response.statusCode !== 200) {
            finish(false);
            return;
          }

          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            finish(parsed?.status === 'ok');
          } catch (_error) {
            finish(false);
          }
        });
      });
    } catch (_error) {
      finish(false);
      return;
    }

    request.on('error', () => finish(false));
    request.setTimeout(timeoutMs, () => {
      request.destroy();
      finish(false);
    });
  });
}

async function waitForHealthUrl(urlString, timeoutMs = DEFAULT_START_TIMEOUT_MS, intervalMs = 350) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await probeHealthUrl(urlString, Math.min(intervalMs, 1500))) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

function normalizeNetworkMode(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return normalizedValue === 'lan' || normalizedValue === 'local'
    ? normalizedValue
    : DEFAULT_NETWORK_MODE;
}

function resolveNetworkMode() {
  return normalizeNetworkMode(process.env.THERMALFS_NETWORK_MODE);
}

function resolveServerBindHost() {
  const explicitHost = String(process.env.THERMALFS_SERVER_HOST || '').trim();
  if (explicitHost) {
    return explicitHost;
  }

  return resolveNetworkMode() === 'lan'
    ? DEFAULT_LAN_BIND_HOST
    : DEFAULT_LOCAL_HOST;
}

function resolveServerConnectHost(bindHost = resolveServerBindHost()) {
  const explicitHost = String(process.env.THERMALFS_SERVER_CONNECT_HOST || '').trim();
  if (explicitHost) {
    return explicitHost;
  }

  if (bindHost === '0.0.0.0' || bindHost === '::') {
    return DEFAULT_LOCAL_HOST;
  }

  return bindHost;
}

function listNetworkAccessUrls(port, options = {}) {
  const bindHost = options.bindHost || resolveServerBindHost();
  const connectHost = options.connectHost || resolveServerConnectHost(bindHost);
  const urls = new Set([`http://${connectHost}:${port}`]);

  if (bindHost !== DEFAULT_LAN_BIND_HOST && bindHost !== '::') {
    return [...urls];
  }

  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (!entry || entry.internal || entry.family !== 'IPv4') {
        continue;
      }

      urls.add(`http://${entry.address}:${port}`);
    }
  }

  return [...urls];
}

function isPortAvailable(host, port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen({ host, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

function killProcessTree(child) {
  if (!child || child.killed) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      const killer = spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      killer.on('error', () => resolve());
      killer.on('exit', () => resolve());
      return;
    }

    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch (_error) {
      try {
        child.kill('SIGTERM');
      } catch (__error) {
      }
    }
    resolve();
  });
}

class NuxtRuntimeManager {
  constructor(options) {
    this.app = options.app;
    this.onServerExit = options.onServerExit || (() => {});
    this.onLog = options.onLog || (() => {});
    this.externalStartUrl = String(process.env.ELECTRON_START_URL || '').trim();
    this.startTimeoutMs = Number(process.env.THERMALFS_START_TIMEOUT_MS || DEFAULT_START_TIMEOUT_MS);
    this.bindHost = resolveServerBindHost();
    this.connectHost = resolveServerConnectHost(this.bindHost);
    this.networkMode = resolveNetworkMode();
    this.child = null;
    this.currentUrl = this.externalStartUrl || '';
    this.currentPort = null;
    this.pendingStart = null;
    this.isQuitting = false;
  }

  isManagedMode() {
    return !this.externalStartUrl;
  }

  getStartUrl() {
    return this.externalStartUrl || this.currentUrl || DEFAULT_DEV_URL;
  }

  getHealthUrl(targetUrl = this.getStartUrl()) {
    return new URL('/api/health', targetUrl).toString();
  }

  markAppQuitting() {
    this.isQuitting = true;
  }

  async ensureStarted(options = {}) {
    if (!this.isManagedMode()) {
      this.currentUrl = this.externalStartUrl;
      return this.currentUrl;
    }

    if (this.pendingStart) {
      return this.pendingStart;
    }

    const shouldRestart = Boolean(options.restart);
    if (!shouldRestart && this.child && this.currentUrl) {
      const healthy = await probeHealthUrl(this.getHealthUrl(this.currentUrl), 1200);
      if (healthy) {
        return this.currentUrl;
      }
    }

    this.pendingStart = this.startManagedServer(shouldRestart).finally(() => {
      this.pendingStart = null;
    });
    return this.pendingStart;
  }

  async restart() {
    return this.ensureStarted({ restart: true });
  }

  async stop() {
    const child = this.child;
    this.child = null;
    this.currentPort = null;

    if (!child) {
      return;
    }

    await killProcessTree(child);
  }

  async waitForExternalUrl(targetUrl) {
    const healthy = await waitForHealthUrl(this.getHealthUrl(targetUrl), this.startTimeoutMs);
    if (!healthy) {
      throw new Error(`Timed out waiting for ${targetUrl}`);
    }

    this.currentUrl = targetUrl;
    return targetUrl;
  }

  resolveManagedPaths() {
    if (!this.app.isPackaged) {
      throw new Error('Managed Nuxt server is only supported for packaged builds or explicit dev URL mode.');
    }

    const serverRoot = path.join(process.resourcesPath, 'server');
    const runtimeRoot = path.join(process.resourcesPath, 'runtime');
    const nodeExecutable = path.join(runtimeRoot, 'node.exe');
    const serverEntry = path.join(serverRoot, '.output', 'server', 'index.mjs');

    if (!fs.existsSync(nodeExecutable)) {
      throw new Error(`Missing bundled Node runtime: ${nodeExecutable}`);
    }

    if (!fs.existsSync(serverEntry)) {
      throw new Error(`Missing bundled Nuxt server entry: ${serverEntry}`);
    }

    const authSeedPath = path.join(serverRoot, 'auth.json');
    if (!fs.existsSync(authSeedPath)) {
      throw new Error(`Missing bundled auth seed: ${authSeedPath}`);
    }

    return { serverRoot, nodeExecutable, serverEntry, authSeedPath };
  }

  prepareWritableAuthFile(authSeedPath) {
    const dataRoot = path.join(this.app.getPath('userData'), 'server-data');
    const authFilePath = path.join(dataRoot, 'auth.json');
    fs.mkdirSync(dataRoot, { recursive: true });

    if (!fs.existsSync(authFilePath)) {
      fs.copyFileSync(authSeedPath, authFilePath);
      this.onLog(`[nitro] Initialized writable auth data at ${authFilePath}`);
    }

    return authFilePath;
  }

  resolvePortCandidates() {
    const envPort = Number(process.env.THERMALFS_SERVER_PORT || 0);
    if (Number.isInteger(envPort) && envPort > 0) {
      return [envPort];
    }

    return [...DEFAULT_PROD_PORTS];
  }

  async startManagedServer() {
    await this.stop();

    const { serverRoot, nodeExecutable, serverEntry, authSeedPath } = this.resolveManagedPaths();
    const authFilePath = this.prepareWritableAuthFile(authSeedPath);
    const portCandidates = this.resolvePortCandidates();
    let lastError = null;

    for (const port of portCandidates) {
      const available = await isPortAvailable(this.bindHost, port);
      if (!available) {
        lastError = new Error(`Port ${port} is already in use.`);
        continue;
      }

      const env = {
        ...process.env,
        HOST: this.bindHost,
        PORT: String(port),
        NITRO_HOST: this.bindHost,
        NITRO_PORT: String(port),
        NODE_ENV: process.env.NODE_ENV || 'production',
        THERMALFS_AUTH_FILE: authFilePath,
      };

      const child = spawn(nodeExecutable, [serverEntry], {
        cwd: serverRoot,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      child.stdout?.on('data', (chunk) => {
        this.onLog(`[nitro] ${chunk.toString('utf8').trimEnd()}`);
      });
      child.stderr?.on('data', (chunk) => {
        this.onLog(`[nitro] ${chunk.toString('utf8').trimEnd()}`);
      });

      child.on('exit', (code, signal) => {
        const wasCurrentChild = this.child && this.child.pid === child.pid;
        if (wasCurrentChild) {
          this.child = null;
          this.currentPort = null;
        }

        if (!this.isQuitting && wasCurrentChild) {
          this.onServerExit({
            code,
            signal,
            port,
            url: `http://${this.connectHost}:${port}`,
            bindHost: this.bindHost,
            networkMode: this.networkMode,
          });
        }
      });

      const startUrl = `http://${this.connectHost}:${port}`;
      const healthy = await waitForHealthUrl(this.getHealthUrl(startUrl), this.startTimeoutMs);
      if (healthy) {
        this.child = child;
        this.currentPort = port;
        this.currentUrl = startUrl;
        const reachableUrls = listNetworkAccessUrls(port, {
          bindHost: this.bindHost,
          connectHost: this.connectHost,
        });
        this.onLog(
          `[nitro] Server ready in ${this.networkMode} mode on ${reachableUrls.join(', ')}`
        );
        return startUrl;
      }

      lastError = new Error(`Timed out waiting for Nuxt health check on port ${port}.`);
      await killProcessTree(child);
    }

    throw lastError || new Error('Unable to start bundled Nuxt server.');
  }
}

module.exports = {
  DEFAULT_DEV_URL,
  DEFAULT_LOCAL_HOST,
  DEFAULT_NETWORK_MODE,
  DEFAULT_PROD_PORTS,
  DEFAULT_START_TIMEOUT_MS,
  NuxtRuntimeManager,
  listNetworkAccessUrls,
  probeHealthUrl,
  resolveNetworkMode,
  resolveServerBindHost,
  resolveServerConnectHost,
  waitForHealthUrl,
};
