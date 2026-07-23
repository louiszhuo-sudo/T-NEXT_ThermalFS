const { spawn } = require('child_process');
const path = require('path');

const electronBinary = require('electron');
const workspaceRoot = path.resolve(__dirname, '..');
const mainEntry = path.join(workspaceRoot, 'apps', 'electron', 'main.cjs');
const startUrl = process.env.ELECTRON_START_URL || 'http://127.0.0.1:3000';

const child = spawn(electronBinary, [mainEntry], {
  cwd: workspaceRoot,
  env: {
    ...process.env,
    ELECTRON_START_URL: startUrl,
  },
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
