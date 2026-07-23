const path = require('path');
const { spawn } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const nodeBinary = process.execPath;
const electronBuilderCli = path.join(workspaceRoot, 'node_modules', 'electron-builder', 'cli.js');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  await run(nodeBinary, [path.join(workspaceRoot, 'scripts', 'generate-icons.cjs')]);
  await run(nodeBinary, [path.join(workspaceRoot, 'scripts', 'build-desktop.cjs')]);
  await run(nodeBinary, [electronBuilderCli, '--win']);
}

main().catch((error) => {
  console.error('[pack-win] Failed:', error.message);
  process.exit(1);
});
