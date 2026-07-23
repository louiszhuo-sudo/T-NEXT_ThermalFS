const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const nuxtRoot = path.join(workspaceRoot, 'apps', 'nuxt');
const nodeBinary = process.execPath;
const nuxiEntry = path.join(workspaceRoot, 'node_modules', '@nuxt', 'cli', 'bin', 'nuxi.mjs');
const stageRoot = path.join(workspaceRoot, '.desktop');
const stageServerRoot = path.join(stageRoot, 'server');
const stageRuntimeRoot = path.join(stageRoot, 'runtime');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: nuxtRoot,
      stdio: 'inherit',
      windowsHide: true,
      ...options,
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

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyNodeRuntime() {
  const nodeExecutable = process.execPath;
  const destination = path.join(stageRuntimeRoot, path.basename(nodeExecutable));
  fs.copyFileSync(nodeExecutable, destination);
}

function copyServerArtifacts() {
  const outputDir = path.join(nuxtRoot, '.output');
  const authJsonPath = path.join(nuxtRoot, 'auth.json');

  if (!fs.existsSync(outputDir)) {
    throw new Error('Nuxt build output ".output" was not found. Run build:web first.');
  }

  fs.cpSync(outputDir, path.join(stageServerRoot, '.output'), { recursive: true });
  fs.copyFileSync(authJsonPath, path.join(stageServerRoot, 'auth.json'));
}

async function main() {
  await run(nodeBinary, [nuxiEntry, 'build']);
  ensureCleanDir(stageRoot);
  fs.mkdirSync(stageServerRoot, { recursive: true });
  fs.mkdirSync(stageRuntimeRoot, { recursive: true });
  copyServerArtifacts();
  copyNodeRuntime();
  console.log(`[build-desktop] Prepared staged desktop runtime at ${stageRoot}`);
}

main().catch((error) => {
  console.error('[build-desktop] Failed:', error.message);
  process.exit(1);
});
