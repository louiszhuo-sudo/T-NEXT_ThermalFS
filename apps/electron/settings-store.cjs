const fs = require('fs');
const path = require('path');

const DEFAULT_SETTINGS = Object.freeze({
  openAtLogin: false,
  networkMode: 'lan',
  serverPort: 3000,
});

function normalizeNetworkMode(value, fallback = DEFAULT_SETTINGS.networkMode) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'lan' || normalized === 'local') {
    return normalized;
  }
  return fallback;
}

function normalizeServerPort(value, fallback) {
  const port = typeof value === 'string' && value.trim() !== ''
    ? Number(value)
    : value;
  if (Number.isInteger(port) && port >= 1 && port <= 65535) {
    return port;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error('Server port 必須是 1 到 65535 之間的整數。');
}

function createDefaultSettings(env = process.env) {
  return {
    openAtLogin: false,
    networkMode: normalizeNetworkMode(
      env.THERMALFS_NETWORK_MODE,
      DEFAULT_SETTINGS.networkMode
    ),
    serverPort: normalizeServerPort(
      env.THERMALFS_SERVER_PORT,
      DEFAULT_SETTINGS.serverPort
    ),
  };
}

function sanitizeSettings(value = {}, defaults = createDefaultSettings()) {
  return {
    openAtLogin: Boolean(value.openAtLogin ?? defaults.openAtLogin),
    networkMode: normalizeNetworkMode(value.networkMode, defaults.networkMode),
    serverPort: normalizeServerPort(value.serverPort, defaults.serverPort),
  };
}

function validateSettings(value = {}) {
  const networkMode = String(value.networkMode ?? '').trim().toLowerCase();
  if (networkMode !== 'lan' && networkMode !== 'local') {
    throw new Error('網路模式必須是 LAN 或僅限本機。');
  }

  return {
    openAtLogin: Boolean(value.openAtLogin),
    networkMode,
    serverPort: normalizeServerPort(value.serverPort),
  };
}

function readSettings(filePath, defaults = createDefaultSettings()) {
  if (!fs.existsSync(filePath)) {
    return { ...defaults };
  }

  try {
    return sanitizeSettings(JSON.parse(fs.readFileSync(filePath, 'utf8')), defaults);
  } catch (_error) {
    return { ...defaults };
  }
}

function saveSettings(filePath, value) {
  const settings = validateSettings(value);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  return settings;
}

module.exports = {
  DEFAULT_SETTINGS,
  createDefaultSettings,
  normalizeNetworkMode,
  normalizeServerPort,
  readSettings,
  sanitizeSettings,
  saveSettings,
  validateSettings,
};
