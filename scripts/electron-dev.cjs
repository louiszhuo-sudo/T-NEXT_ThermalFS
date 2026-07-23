const { spawn } = require('child_process');
const path = require('path');
const {
  listNetworkAccessUrls,
  resolveNetworkMode,
  resolveServerBindHost,
  resolveServerConnectHost,
  waitForHealthUrl,
} = require('../apps/electron/runtime-manager.cjs');

const workspaceRoot = path.resolve(__dirname, '..');
const nuxtRoot = path.join(workspaceRoot, 'apps', 'nuxt');
const nodeBinary = process.execPath;
const nuxiEntry = path.join(workspaceRoot, 'node_modules', '@nuxt', 'cli', 'bin', 'nuxi.mjs');
const electronBinary = require('electron');
const mainEntry = path.join(workspaceRoot, 'apps', 'electron', 'main.cjs');
const bindHost = resolveServerBindHost();
const connectHost = resolveServerConnectHost(bindHost);
const devStartUrl = `http://${connectHost}:3000`;
const healthUrl = new URL('/api/health', devStartUrl).toString();
const startTimeoutMs = Number(process.env.THERMALFS_START_TIMEOUT_MS || 30000);
const networkMode = resolveNetworkMode();

let isShuttingDown = false;
let electronChild = null;
let nuxtChild = null;

function log(prefix, chunk) {
  const text = chunk.toString('utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line) {
      continue;
    }
    console.log(`${prefix} ${line}`);
  }
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

function spawnNuxt() {
  const child = spawn(nodeBinary, [nuxiEntry, 'dev', '--host', bindHost, '--port', '3000'], {
    cwd: nuxtRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  child.stdout?.on('data', (chunk) => log('[nuxt]', chunk));
  child.stderr?.on('data', (chunk) => log('[nuxt]', chunk));
  return child;
}

async function startNuxtWithHealthCheck() {
  nuxtChild = spawnNuxt();
  const healthy = await waitForHealthUrl(healthUrl, startTimeoutMs);
  if (!healthy) {
    throw new Error(`Nuxt dev server was not ready within ${startTimeoutMs} ms.`);
  }

  console.log(
    `[runner] Nuxt dev server ready in ${networkMode} mode on ${listNetworkAccessUrls(3000, {
      bindHost,
      connectHost,
    }).join(', ')}`
  );
}

function scheduleNuxtRestart() {
  if (isShuttingDown) {
    return;
  }

  setTimeout(async () => {
    if (isShuttingDown) {
      return;
    }

    try {
      console.log('[runner] Restarting Nuxt dev server after unexpected exit.');
      await startNuxtWithHealthCheck();
    } catch (error) {
      console.error('[runner] Failed to restart Nuxt dev server:', error.message);
      scheduleNuxtRestart();
    }
  }, 1000);
}

async function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  await Promise.all([
    killProcessTree(electronChild),
    killProcessTree(nuxtChild),
  ]);
  process.exit(exitCode);
}

async function main() {
  await startNuxtWithHealthCheck();

  nuxtChild.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    console.error(`[runner] Nuxt dev server exited unexpectedly (code=${code ?? 'null'}, signal=${signal ?? 'null'}).`);
    nuxtChild = null;
    scheduleNuxtRestart();
  });

  electronChild = spawn(electronBinary, [mainEntry], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      ELECTRON_START_URL: devStartUrl,
    },
    stdio: 'inherit',
    windowsHide: false,
  });

  electronChild.on('exit', async (code, signal) => {
    if (signal) {
      await shutdown(1);
      return;
    }

    await shutdown(code ?? 0);
  });
}

process.on('SIGINT', () => {
  void shutdown(130);
});
process.on('SIGTERM', () => {
  void shutdown(143);
});

main().catch(async (error) => {
  console.error('[runner] electron:dev failed:', error.message);
  await shutdown(1);
});
