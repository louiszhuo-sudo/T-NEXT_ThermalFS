const assert = require('node:assert/strict');
const test = require('node:test');

const {
  DEFAULT_LAN_BIND_HOST,
  DEFAULT_LOCAL_HOST,
  NuxtRuntimeManager,
  listNetworkAccessUrls,
  normalizeNetworkMode,
  normalizeServerPort,
  resolveServerBindHost,
  resolveServerConnectHost,
} = require('../apps/electron/runtime-manager.cjs');

test('normalizes managed server settings', () => {
  assert.equal(normalizeNetworkMode('LOCAL'), 'local');
  assert.equal(normalizeNetworkMode('unknown'), 'lan');
  assert.equal(normalizeServerPort('4100'), 4100);
  assert.equal(normalizeServerPort('invalid'), 3000);
});

test('maps LAN and local modes to the expected bind hosts', () => {
  assert.equal(
    resolveServerBindHost('lan', { useEnvironment: false }),
    DEFAULT_LAN_BIND_HOST
  );
  assert.equal(
    resolveServerBindHost('local', { useEnvironment: false }),
    DEFAULT_LOCAL_HOST
  );
  assert.equal(
    resolveServerConnectHost(DEFAULT_LAN_BIND_HOST, { useEnvironment: false }),
    DEFAULT_LOCAL_HOST
  );
});

test('local access URLs only contain the loopback address', () => {
  assert.deepEqual(
    listNetworkAccessUrls(3000, {
      bindHost: DEFAULT_LOCAL_HOST,
      connectHost: DEFAULT_LOCAL_HOST,
    }),
    ['http://127.0.0.1:3000']
  );
});

test('restores the previous network config when a restart fails', async () => {
  const manager = new NuxtRuntimeManager({
    app: {},
    networkMode: 'lan',
    serverPort: 3000,
  });
  let restored = false;
  manager.stop = async () => {};
  manager.ensureStarted = async () => {
    if (manager.serverPort === 4500) {
      throw new Error('test start failure');
    }
    restored = true;
    return `http://127.0.0.1:${manager.serverPort}`;
  };

  await assert.rejects(
    manager.restartWithConfig({ networkMode: 'local', serverPort: 4500 }),
    /test start failure/
  );
  assert.deepEqual(manager.getNetworkConfig(), {
    networkMode: 'lan',
    serverPort: 3000,
  });
  assert.equal(restored, true);
});
