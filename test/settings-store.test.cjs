const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  DEFAULT_SETTINGS,
  createDefaultSettings,
  normalizeServerPort,
  readSettings,
  saveSettings,
  validateSettings,
} = require('../apps/electron/settings-store.cjs');

test('uses LAN port 3000 defaults', () => {
  assert.deepEqual(
    createDefaultSettings({}),
    DEFAULT_SETTINGS
  );
});

test('uses valid environment values as first-run defaults', () => {
  assert.deepEqual(
    createDefaultSettings({
      THERMALFS_NETWORK_MODE: 'local',
      THERMALFS_SERVER_PORT: '4567',
    }),
    {
      openAtLogin: false,
      networkMode: 'local',
      serverPort: 4567,
    }
  );
});

test('rejects invalid settings and port boundaries', () => {
  assert.throws(() => normalizeServerPort(0), /1 到 65535/);
  assert.throws(() => normalizeServerPort(65536), /1 到 65535/);
  assert.throws(() => normalizeServerPort(3000.5), /1 到 65535/);
  assert.throws(
    () => validateSettings({ networkMode: 'public', serverPort: 3000 }),
    /LAN 或僅限本機/
  );
  assert.equal(normalizeServerPort('65535'), 65535);
});

test('falls back when the settings file is corrupt', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'thermalfs-settings-'));
  const filePath = path.join(root, 'settings.json');
  try {
    fs.writeFileSync(filePath, '{invalid', 'utf8');
    assert.deepEqual(readSettings(filePath, DEFAULT_SETTINGS), DEFAULT_SETTINGS);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('saves normalized settings and reads them back', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'thermalfs-settings-'));
  const filePath = path.join(root, 'settings.json');
  try {
    const saved = saveSettings(filePath, {
      openAtLogin: true,
      networkMode: 'LAN',
      serverPort: '4321',
    });
    assert.deepEqual(saved, {
      openAtLogin: true,
      networkMode: 'lan',
      serverPort: 4321,
    });
    assert.deepEqual(readSettings(filePath), saved);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
