const { spawn } = require('child_process');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const nuxtRoot = path.join(workspaceRoot, 'apps', 'nuxt');
const nuxiEntry = path.join(workspaceRoot, 'node_modules', '@nuxt', 'cli', 'bin', 'nuxi.mjs');
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node scripts/run-nuxt.cjs <command> [...args]');
  process.exit(1);
}

const child = spawn(process.execPath, [nuxiEntry, command, ...args], {
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
