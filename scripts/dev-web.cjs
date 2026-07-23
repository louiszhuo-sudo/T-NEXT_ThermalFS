const { spawn } = require('child_process');
const path = require('path');
const {
  listNetworkAccessUrls,
  resolveNetworkMode,
  resolveServerBindHost,
  resolveServerConnectHost,
} = require('../apps/electron/runtime-manager.cjs');

const workspaceRoot = path.resolve(__dirname, '..');
const nuxtRoot = path.join(workspaceRoot, 'apps', 'nuxt');
const nodeBinary = process.execPath;
const nuxiEntry = path.join(workspaceRoot, 'node_modules', '@nuxt', 'cli', 'bin', 'nuxi.mjs');
const bindHost = resolveServerBindHost();
const connectHost = resolveServerConnectHost(bindHost);
const networkMode = resolveNetworkMode();

console.log(
  `[dev:web] Starting Nuxt in ${networkMode} mode on ${listNetworkAccessUrls(3000, {
    bindHost,
    connectHost,
  }).join(', ')}`
);

const child = spawn(nodeBinary, [nuxiEntry, 'dev', '--host', bindHost, '--port', '3000'], {
  cwd: nuxtRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
