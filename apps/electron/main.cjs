const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  Tray,
  dialog,
  globalShortcut,
  ipcMain,
  screen,
  session,
} = require('electron');
const path = require('path');
const fs = require('fs');
const { MonitoringManager } = require('./client-monitoring/monitoring-manager');
const {
  DEFAULT_DEV_URL,
  NuxtRuntimeManager,
  probeHealthUrl,
} = require('./runtime-manager.cjs');
const {
  createDefaultSettings,
  readSettings,
  saveSettings,
  validateSettings,
} = require('./settings-store.cjs');

app.setName('ThermalFS');
const appUserModelId = 'com.yst.thermalfs.donghe';
app.setAppUserModelId(appUserModelId);

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

let startUrl = process.env.ELECTRON_START_URL || DEFAULT_DEV_URL;
const defaultAutoLoginCredentials = {
  username: process.env.THERMALFS_USERNAME || 'admin',
  password: process.env.THERMALFS_PASSWORD || 'admin',
};
const authCookieName = 'nuxt-jwt-auth-token';
const authSessionLifetimeMs = 14 * 24 * 60 * 60 * 1000;
const releaseUpdateDate = '2026-07-27';
const copyrightNotice = 'Copyright © 2026 YST. All rights reserved.';
const legacyUserDataDirNames = [];
const defaultGeneralBounds = { x: 100, y: 100, width: 1280, height: 720 };
const monitoringWindowBounds = { width: 1280, height: 720 };
const recoveryCountdownSeconds = 10;
const defaultElectronRenderMode = 'performance';
const defaultUnresponsiveRecoveryDelayMs = Number(process.env.THERMALFS_UNRESPONSIVE_DELAY_MS || 15000);
const defaultStartupUnresponsiveGraceMs = Number(process.env.THERMALFS_STARTUP_UNRESPONSIVE_GRACE_MS || 20000);

let mainWindow = null;
let recoveryWindow = null;
let monitoringWindow = null;
let settingsWindow = null;
let appTray = null;
let monitoringManager = null;
let isAlwaysOnTop = true;
let isMiniMode = false;
let isPresentationMode = true;
let lastNormalBounds = { ...defaultGeneralBounds };
let cookieSaveTimer = null;
let autoLoginLock = false;
let isAboutDialogOpen = false;
let isRecovering = false;
let isRestartingMainWindow = false;
let isAppQuitting = false;
let isApplyingSettings = false;
let recoveryCountdownTimer = null;
let allowManualMinimize = false;
let remainingRecoverySeconds = 0;
let isRecoveryPaused = false;
let recoveryTargetUrl = startUrl;
let recoveryTargetFrameless = false;
let recoveryReason = '';
let recoveryDetails = {};
let runtimeManager = null;
let currentSettings = createDefaultSettings();

function clearPendingUnresponsiveRecovery(win) {
  if (!win || !win.__pendingUnresponsiveRecoveryTimer) {
    return;
  }

  clearTimeout(win.__pendingUnresponsiveRecoveryTimer);
  win.__pendingUnresponsiveRecoveryTimer = null;
}

function scheduleUnresponsiveRecovery(win) {
  if (!win || win.isDestroyed() || isAppQuitting || isRecovering || isApplyingSettings) {
    return;
  }

  if (win.__pendingUnresponsiveRecoveryTimer) {
    return;
  }

  const lastLoadedAt = win.__lastDidFinishLoadAt || win.__createdAt || Date.now();
  const sinceLoadMs = Math.max(0, Date.now() - lastLoadedAt);
  const waitMs = sinceLoadMs < defaultStartupUnresponsiveGraceMs
    ? Math.max(defaultUnresponsiveRecoveryDelayMs, defaultStartupUnresponsiveGraceMs - sinceLoadMs)
    : defaultUnresponsiveRecoveryDelayMs;

  console.warn(`[SelfCheck] Window became unresponsive, waiting ${waitMs} ms before recovery.`);

  win.__pendingUnresponsiveRecoveryTimer = setTimeout(() => {
    win.__pendingUnresponsiveRecoveryTimer = null;

    if (!win || win.isDestroyed() || isAppQuitting || isRecovering || isApplyingSettings) {
      return;
    }

    if (win.webContents.isLoadingMainFrame()) {
      scheduleUnresponsiveRecovery(win);
      return;
    }

    startSelfCheckRecovery('window-unresponsive', {
      waitMs,
      sinceLoadMs: Math.max(0, Date.now() - lastLoadedAt),
    });
  }, waitMs);
}

function updateStartUrl(nextUrl) {
  if (!nextUrl) {
    return;
  }

  startUrl = nextUrl;
  if (!recoveryTargetUrl) {
    recoveryTargetUrl = nextUrl;
  }
}

async function resolveAppStartUrl(options = {}) {
  if (!runtimeManager) {
    return startUrl;
  }

  if (runtimeManager.isManagedMode()) {
    const nextUrl = options.restartManagedServer
      ? await runtimeManager.restart()
      : await runtimeManager.ensureStarted();
    updateStartUrl(nextUrl);
    return nextUrl;
  }

  const externalUrl = process.env.ELECTRON_START_URL || startUrl;
  const nextUrl = options.waitForHealth === false
    ? externalUrl
    : await runtimeManager.waitForExternalUrl(externalUrl);
  updateStartUrl(nextUrl);
  return nextUrl;
}

async function isUrlHealthy(targetUrl) {
  if (!targetUrl) {
    return false;
  }

  const healthUrl = new URL('/api/health', targetUrl).toString();
  return probeHealthUrl(healthUrl, 1200);
}

function configureHardwareAcceleration() {
  const requestedMode = String(process.env.THERMALFS_ELECTRON_RENDER_MODE || '')
    .trim()
    .toLowerCase();
  const renderMode = requestedMode || defaultElectronRenderMode;

  if (renderMode === 'compat' || renderMode === 'software') {
    console.log(`[electron] Using ${renderMode} render mode.`);
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-gpu');
    app.commandLine.appendSwitch('disable-gpu-compositing');
    app.commandLine.appendSwitch('disable-gpu-rasterization');
    app.commandLine.appendSwitch('in-process-gpu');
    return;
  }

  const commonSwitches = [
    ['ignore-gpu-blocklist'],
    ['enable-gpu-rasterization'],
    ['enable-zero-copy'],
  ];

  console.log(`[electron] Using ${renderMode} render mode.`);

  for (const [name, value] of commonSwitches) {
    if (value) {
      app.commandLine.appendSwitch(name, value);
    } else {
      app.commandLine.appendSwitch(name);
    }
  }

  if (process.platform === 'win32') {
    app.commandLine.appendSwitch('use-angle', 'd3d11');
    return;
  }

  if (process.platform === 'linux') {
    process.env.LIBVA_DRIVER_NAME = process.env.LIBVA_DRIVER_NAME || 'iHD';
    app.commandLine.appendSwitch('use-gl', 'egl');
  }
}

function registerGpuLogging() {
  app.on('gpu-info-update', () => {
    try {
      console.log('GPU Feature Status:', app.getGPUFeatureStatus());
    } catch (error) {
      console.error('Failed to read GPU feature status:', error);
    }
  });

  app.on('gpu-process-crashed', (_event, killed) => {
    appendSelfCheckLog('gpu-process-crashed', { killed });
    console.error('[GPU] gpu-process-crashed', { killed });
  });

  app.on('child-process-gone', (_event, details) => {
    if (details?.type === 'GPU') {
      appendSelfCheckLog('child-process-gone', details);
      console.error('[GPU] child-process-gone', details);
    }
  });
}

function getCookiesFilePath() {
  return path.join(app.getPath('userData'), 'cookies.json');
}

function getSettingsFilePath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function getAutoLoginConfigPath() {
  return path.join(app.getPath('userData'), 'auto-login.json');
}

function getSelfCheckLogPath() {
  const logDir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  return path.join(logDir, 'self-check.log');
}

function getTrayIconPath() {
  const iconFileName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  return path.join(__dirname, 'assets', iconFileName);
}

function focusWindow(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  if (win.isMinimized()) {
    win.restore();
  }

  if (!win.isVisible()) {
    win.show();
  }

  win.focus();
}

function focusExistingPrimaryWindow() {
  const targetWindow = settingsWindow && !settingsWindow.isDestroyed()
    ? settingsWindow
    : recoveryWindow && !recoveryWindow.isDestroyed()
      ? recoveryWindow
      : mainWindow && !mainWindow.isDestroyed()
        ? mainWindow
        : null;

  focusWindow(targetWindow);
}

function getAboutDialogParent() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow && !focusedWindow.isDestroyed()) {
    return focusedWindow;
  }

  return [mainWindow, recoveryWindow, monitoringWindow]
    .find((win) => win && !win.isDestroyed() && win.isVisible()) || null;
}

async function showAboutDialog() {
  if (isAboutDialogOpen) {
    return;
  }

  isAboutDialogOpen = true;
  const options = {
    type: 'info',
    buttons: ['確定'],
    defaultId: 0,
    cancelId: 0,
    title: '關於 ThermalFS',
    message: 'ThermalFS',
    detail: [
      `程式版本：${app.getVersion()}`,
      `更新日期：${releaseUpdateDate}`,
      '',
      copyrightNotice,
    ].join('\n'),
    noLink: true,
  };

  try {
    const parentWindow = getAboutDialogParent();
    if (parentWindow) {
      await dialog.showMessageBox(parentWindow, options);
    } else {
      await dialog.showMessageBox(options);
    }
  } catch (error) {
    console.error('Failed to show About dialog:', error);
  } finally {
    isAboutDialogOpen = false;
  }
}

function getLegacyUserDataDirectories() {
  const currentUserDataPath = app.getPath('userData');
  const appDataPath = app.getPath('appData');

  return legacyUserDataDirNames
    .map((dirName) => path.join(appDataPath, dirName))
    .filter((dirPath) => dirPath !== currentUserDataPath);
}

function getStartUrlHost() {
  try {
    return new URL(startUrl).hostname;
  } catch (error) {
    return null;
  }
}

function isLoginPage(url) {
  try {
    const pathname = new URL(url).pathname.replace(/\/+$/, '') || '/';
    return pathname === '/login' || pathname.endsWith('/login');
  } catch (error) {
    return false;
  }
}

function isRelevantCookie(cookie) {
  const host = getStartUrlHost();
  if (!host) {
    return true;
  }

  const domain = (cookie.domain || '').replace(/^\./, '');
  return !domain || domain === host || host.endsWith(`.${domain}`) || domain.endsWith(`.${host}`);
}

function getCookieUrl(cookie) {
  const protocol = cookie.secure ? 'https://' : 'http://';
  const domain = String(cookie.domain || getStartUrlHost() || '').replace(/^\./, '');
  const cookiePath = cookie.path || '/';
  return `${protocol}${domain}${cookiePath}`;
}

function getJwtExpiry(token) {
  try {
    const [, payload] = String(token || '').split('.');
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(Buffer.from(normalizedPayload, 'base64').toString('utf8'));
    return Number.isFinite(decodedPayload.exp) ? decodedPayload.exp * 1000 : null;
  } catch (_error) {
    return null;
  }
}

function getAuthCookieStatus(cookie) {
  try {
    const authData = JSON.parse(decodeURIComponent(cookie.value));
    const expiresAt = getJwtExpiry(authData?.token);

    if (!authData?.token || !authData?.user || !expiresAt) {
      return { valid: false, reason: 'invalid-auth-data' };
    }

    if (expiresAt <= Date.now()) {
      return { valid: false, reason: 'token-expired', expiresAt };
    }

    return { valid: true, expiresAt };
  } catch (_error) {
    return { valid: false, reason: 'invalid-auth-data' };
  }
}

function appendSelfCheckLog(reason, details = {}) {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${reason} ${JSON.stringify(details)}\n`;
  fs.appendFileSync(getSelfCheckLogPath(), line, 'utf8');
}

function handleManagedServerExit(details) {
  if (isAppQuitting || isApplyingSettings) {
    return;
  }

  startSelfCheckRecovery('nitro-process-exited', details);
}

function shouldRestoreSessionFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return true;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    return content.length === 0 || content === '[]' || content === '{}';
  } catch (error) {
    console.error(`Failed to inspect session file ${filePath}:`, error);
    return false;
  }
}

function migrateLegacySessionData() {
  const currentUserDataPath = app.getPath('userData');
  fs.mkdirSync(currentUserDataPath, { recursive: true });

  const filesToMigrate = ['cookies.json', 'auto-login.json'];

  for (const legacyDirPath of getLegacyUserDataDirectories()) {
    if (!fs.existsSync(legacyDirPath)) {
      continue;
    }

    for (const fileName of filesToMigrate) {
      const sourcePath = path.join(legacyDirPath, fileName);
      const targetPath = path.join(currentUserDataPath, fileName);

      if (!fs.existsSync(sourcePath) || !shouldRestoreSessionFile(targetPath)) {
        continue;
      }

      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Migrated ${fileName} from ${legacyDirPath}`);
      } catch (error) {
        console.error(`Failed to migrate ${fileName} from ${legacyDirPath}:`, error);
      }
    }
  }
}

function loadAutoLoginCredentials() {
  const configPath = getAutoLoginConfigPath();

  if (!fs.existsSync(configPath)) {
    return defaultAutoLoginCredentials;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      username: config.username || defaultAutoLoginCredentials.username,
      password: config.password || defaultAutoLoginCredentials.password,
    };
  } catch (error) {
    console.error('Failed to read auto login config:', error);
    return defaultAutoLoginCredentials;
  }
}

async function saveCookies() {
  try {
    const cookies = (await session.defaultSession.cookies.get({})).filter(isRelevantCookie);
    fs.writeFileSync(getCookiesFilePath(), JSON.stringify(cookies, null, 2), 'utf8');
    console.log(`Saved cookies to ${getCookiesFilePath()}`);
    return cookies;
  } catch (error) {
    console.error('Failed to save cookies:', error);
    return [];
  }
}

async function loadCookies() {
  const filePath = getCookiesFilePath();
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    const cookies = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const cookie of cookies) {
      const {
        name,
        value,
        domain,
        path: cookiePath = '/',
        secure,
        httpOnly,
        expirationDate,
        sameSite,
      } = cookie;

      const protocol = secure ? 'https://' : 'http://';
      const normalizedDomain = domain.startsWith('.') ? domain.slice(1) : domain;
      const url = `${protocol}${normalizedDomain}${cookiePath}`;

      try {
        await session.defaultSession.cookies.set({
          url,
          name,
          value,
          domain,
          path: cookiePath,
          secure,
          httpOnly,
          expirationDate,
          sameSite,
        });
      } catch (error) {
        console.error(`Failed to restore cookie ${name}:`, error);
      }
    }

    console.log(`Loaded cookies from ${filePath}`);
  } catch (error) {
    console.error(`Failed to load cookies from ${filePath}:`, error);
  }
}

async function clearAuthCookieForStartup() {
  try {
    const cookies = await session.defaultSession.cookies.get({});
    const authCookies = cookies.filter((cookie) => cookie.name === authCookieName);

    for (const cookie of authCookies) {
      await session.defaultSession.cookies.remove(getCookieUrl(cookie), cookie.name);
    }

    if (authCookies.length > 0) {
      await saveCookies();
      console.log(`Cleared ${authCookies.length} saved auth cookie(s) for fresh startup login.`);
    }
  } catch (error) {
    console.error('Failed to clear auth cookie for fresh startup login:', error);
  }
}

function scheduleCookieSave() {
  clearTimeout(cookieSaveTimer);
  cookieSaveTimer = setTimeout(() => {
    saveCookies().catch((error) => {
      console.error('Failed to persist cookies:', error);
    });
  }, 400);
}

function registerCookiePersistence() {
  session.defaultSession.cookies.on('changed', (event, cookie, cause, removed) => {
    if (removed || !isRelevantCookie(cookie)) {
      return;
    }

    if (cookie.name === authCookieName) {
      scheduleCookieSave();
    }
  });
}

async function attemptAutoLogin(win) {
  if (autoLoginLock || !win || win.isDestroyed()) {
    return;
  }

  autoLoginLock = true;

  try {
    const credentials = loadAutoLoginCredentials();
    const script = `
      (async () => {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            username: ${JSON.stringify(credentials.username)},
            password: ${JSON.stringify(credentials.password)},
          }),
        });

        if (!response.ok) {
          return { ok: false, reason: 'login-request-failed', status: response.status };
        }

        const authData = await response.json();
        if (!authData?.token || !authData?.user) {
          return { ok: false, reason: 'invalid-login-response' };
        }

        const expires = new Date(Date.now() + ${authSessionLifetimeMs}).toUTCString();
        document.cookie = ${JSON.stringify(authCookieName)} + '=' + encodeURIComponent(JSON.stringify(authData))
          + '; Path=/; Expires=' + expires + '; SameSite=Strict';
        window.location.replace('/');
        return { ok: true };
      })();
    `;

    const result = await win.webContents.executeJavaScript(script, true);
    if (result?.ok) {
      console.log(`Auto login submitted for ${credentials.username}`);
    } else {
      console.log('Auto login skipped:', result?.reason || 'unknown', result?.debug || {});
    }
  } catch (error) {
    console.error('Failed to auto login:', error);
  } finally {
    autoLoginLock = false;
  }
}

async function handleAutoLoginForUrl(win, url) {
  if (!isLoginPage(url)) {
    scheduleCookieSave();
    return;
  }

  const existingCookies = await session.defaultSession.cookies.get({ url: startUrl });
  const authCookie = existingCookies.find((cookie) => cookie.name === authCookieName);
  const authCookieStatus = authCookie ? getAuthCookieStatus(authCookie) : null;

  if (authCookie && !authCookieStatus.valid) {
    console.log(`Discarding ${authCookieStatus.reason} auth cookie before auto login.`);
    await session.defaultSession.cookies.remove(getCookieUrl(authCookie), authCookie.name);
    scheduleCookieSave();
  }

  if (!authCookieStatus?.valid) {
    await attemptAutoLogin(win);
  }
}

function getTargetDisplay(win = null) {
  if (win && !win.isDestroyed()) {
    return screen.getDisplayMatching(win.getBounds());
  }

  return screen.getPrimaryDisplay();
}

function getPresentationBounds(win = null) {
  const display = getTargetDisplay(win);
  return { ...display.bounds };
}

function rememberGeneralBounds(win) {
  if (!win || win.isDestroyed() || isPresentationMode || win.isFullScreen()) {
    return;
  }

  lastNormalBounds = win.getBounds();
}

function destroyWindowSilently(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  win.__skipRecovery = true;
  win.destroy();
}

function clearRecoveryTimers() {
  clearInterval(recoveryCountdownTimer);
  recoveryCountdownTimer = null;
}

function formatRecoveryDetailValue(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function syncRecoveryWindowState() {
  if (!recoveryWindow || recoveryWindow.isDestroyed()) {
    return;
  }

  recoveryWindow.webContents.send('recovery:state', getRecoveryStatePayload());
  fitRecoveryWindowToContent();
}

async function fitRecoveryWindowToContent() {
  if (!recoveryWindow || recoveryWindow.isDestroyed()) {
    return;
  }

  try {
    const size = await recoveryWindow.webContents.executeJavaScript(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        return {
          width: Math.ceil(Math.max(root.scrollWidth, body.scrollWidth, root.offsetWidth, body.offsetWidth)),
          height: Math.ceil(Math.max(root.scrollHeight, body.scrollHeight, root.offsetHeight, body.offsetHeight))
        };
      })()
    `, true);

    const width = Math.max(430, Math.min(size.width, 520));
    const height = Math.max(330, Math.min(size.height, 460));
    recoveryWindow.setContentSize(width, height);
    recoveryWindow.center();
  } catch (error) {
    console.error('Failed to fit recovery window to content:', error);
  }
}

function closeRecoveryWindow(force = true) {
  if (!recoveryWindow || recoveryWindow.isDestroyed()) {
    recoveryWindow = null;
    refreshTrayMenu();
    return;
  }

  const previousWindow = recoveryWindow;
  recoveryWindow = null;
  previousWindow.__allowClose = force;
  previousWindow.close();
  refreshTrayMenu();
}

function resetRecoveryState() {
  clearRecoveryTimers();
  isRecovering = false;
  isRecoveryPaused = false;
  remainingRecoverySeconds = 0;
  recoveryTargetUrl = startUrl;
  recoveryTargetFrameless = false;
  recoveryReason = '';
  recoveryDetails = {};
}

function createRecoveryWindow() {
  if (recoveryWindow && !recoveryWindow.isDestroyed()) {
    recoveryWindow.focus();
    syncRecoveryWindowState();
    return recoveryWindow;
  }

  const win = new BrowserWindow({
    width: 450,
    height: 380,
    show: false,
    useContentSize: true,
    title: 'ThermalFS 自檢復原',
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'recovery-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.removeMenu();
  win.setAlwaysOnTop(true, 'screen-saver');
  win.on('close', (event) => {
    if (win.__allowClose || isAppQuitting) {
      return;
    }

    event.preventDefault();
    const result = dialog.showMessageBoxSync(win, {
      type: 'warning',
      buttons: ['取消', '退出程式'],
      defaultId: 0,
      cancelId: 0,
      title: '恢復中的主視窗',
      message: '目前正在等待自檢復原完成。若直接關閉這個視窗，ThermalFS 也會一併結束。',
    });

    if (result === 1) {
      quitApplication('recovery-window-close');
    }
  });
  win.on('closed', () => {
    if (recoveryWindow === win) {
      recoveryWindow = null;
    }
    refreshTrayMenu();
  });
  win.webContents.on('did-finish-load', () => {
    syncRecoveryWindowState();
    fitRecoveryWindowToContent();
  });
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
    refreshTrayMenu();
  });

  win.loadFile(path.join(__dirname, 'recovery.html'));
  recoveryWindow = win;
  refreshTrayMenu();
  return win;
}

function getRecoveryReasonLabel(reason) {
  const labels = {
    'render-process-gone': '主畫面 renderer 異常結束',
    'did-fail-load': '主畫面載入失敗',
    'window-unresponsive': '主視窗無回應',
    'window-closed-unexpectedly': '主視窗意外關閉',
    'manual-browser-close': '手動觸發自檢重啟',
    'nitro-process-exited': '內建 Nuxt server 異常結束',
    'server-start-failed': '內建 Nuxt server 啟動失敗',
  };

  return labels[reason] || '未知異常';
}

function getRecoveryStatePayload() {
  const detailLines = Object.entries(recoveryDetails || {})
    .map(([key, value]) => {
      const formattedValue = formatRecoveryDetailValue(value);
      return formattedValue ? `${key}: ${formattedValue}` : '';
    })
    .filter(Boolean);

  return {
    title: 'ThermalFS 自檢復原視窗',
    reasonLabel: getRecoveryReasonLabel(recoveryReason),
    reasonCode: recoveryReason || 'unknown',
    detailsText: detailLines.join('\n') || '目前沒有額外錯誤細節。',
    countdownLabel: isRecoveryPaused
      ? `自檢已暫停，剩餘 ${remainingRecoverySeconds} 秒`
      : `${remainingRecoverySeconds} 秒後自動重新開啟主畫面`,
    remainingSeconds: remainingRecoverySeconds,
    isPaused: isRecoveryPaused,
  };
}

function startRecoveryCountdown(seconds = remainingRecoverySeconds || recoveryCountdownSeconds) {
  clearRecoveryTimers();
  remainingRecoverySeconds = Math.max(0, seconds);

  if (!isRecovering || isRecoveryPaused) {
    syncRecoveryWindowState();
    return;
  }

  syncRecoveryWindowState();

  recoveryCountdownTimer = setInterval(() => {
    remainingRecoverySeconds -= 1;

    if (remainingRecoverySeconds <= 0) {
      void restartMainWindowFromRecovery('countdown-complete');
      return;
    }

    syncRecoveryWindowState();
  }, 1000);
}

function toggleRecoveryPause() {
  if (!isRecovering) {
    return;
  }

  isRecoveryPaused = !isRecoveryPaused;
  if (isRecoveryPaused) {
    clearRecoveryTimers();
    syncRecoveryWindowState();
    return;
  }

  startRecoveryCountdown(remainingRecoverySeconds);
}

async function restartMainWindowFromRecovery(source = 'manual') {
  if (!isRecovering || isAppQuitting || isRestartingMainWindow) {
    return;
  }

  isRestartingMainWindow = true;
  clearRecoveryTimers();
  const targetFrameless = recoveryTargetFrameless;

  try {
    const currentTargetUrl = recoveryTargetUrl || startUrl;
    const shouldRestartManagedServer = runtimeManager?.isManagedMode()
      ? true
      : !(await isUrlHealthy(currentTargetUrl));
    const targetUrl = await resolveAppStartUrl({
      restartManagedServer: shouldRestartManagedServer,
      waitForHealth: true,
    });

    console.log(`[SelfCheck] Restarting main window from ${source}.`);
    closeRecoveryWindow(true);
    createWindow(targetFrameless, null, targetUrl);
    monitoringManager?.recordEvent('session-resume', 'Main window restored after recovery.', {
      source,
      reason: recoveryReason,
    });
    resetRecoveryState();
  } catch (error) {
    recoveryReason = 'server-start-failed';
    recoveryDetails = {
      source,
      message: error.message,
    };
    remainingRecoverySeconds = recoveryCountdownSeconds;
    isRecoveryPaused = false;
    isRecovering = true;
    appendSelfCheckLog('server-start-failed', recoveryDetails);
    createRecoveryWindow();
    startRecoveryCountdown(remainingRecoverySeconds);
  } finally {
    isRestartingMainWindow = false;
  }
}

function registerRecoveryIpc() {
  ipcMain.handle('recovery:request-state', () => getRecoveryStatePayload());
  ipcMain.on('recovery:toggle-pause', () => {
    toggleRecoveryPause();
  });
  ipcMain.on('recovery:start-now', () => {
    void restartMainWindowFromRecovery('recovery-window-button');
  });
  ipcMain.on('recovery:quit-app', () => {
    quitApplication('recovery-window-button');
  });
}

function getLoginExecutablePath() {
  return process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
}

function getLoginItemOptions() {
  return {
    path: getLoginExecutablePath(),
    args: [],
  };
}

function getOpenAtLoginState() {
  if (process.platform !== 'win32' || !app.isPackaged) {
    return currentSettings.openAtLogin;
  }

  return app.getLoginItemSettings(getLoginItemOptions()).openAtLogin;
}

function applyLoginItemSettings(openAtLogin) {
  if (process.platform !== 'win32' || !app.isPackaged) {
    return;
  }

  app.setLoginItemSettings({
    ...getLoginItemOptions(),
    name: appUserModelId,
    openAtLogin: Boolean(openAtLogin),
  });
}

function getSettingsPayload(settings = currentSettings) {
  return {
    ...settings,
    managedMode: Boolean(runtimeManager?.isManagedMode()),
    accessUrls: runtimeManager?.getAccessUrls() || [],
  };
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    focusWindow(settingsWindow);
    return settingsWindow;
  }

  const win = new BrowserWindow({
    width: 590,
    height: 610,
    show: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    autoHideMenuBar: true,
    title: 'ThermalFS 設定',
    backgroundColor: '#eef3f7',
    webPreferences: {
      preload: path.join(__dirname, 'settings-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.removeMenu();
  win.setAlwaysOnTop(true, 'screen-saver');
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });
  win.on('close', (event) => {
    if (isApplyingSettings && !isAppQuitting) {
      event.preventDefault();
    }
  });
  win.on('closed', () => {
    if (settingsWindow === win) {
      settingsWindow = null;
    }
  });
  settingsWindow = win;
  void win.loadFile(path.join(__dirname, 'settings.html'));
  return win;
}

async function confirmManagedServerRestart() {
  const owner = settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow : undefined;
  const result = await dialog.showMessageBox(owner, {
    type: 'question',
    title: '重新啟動前端服務',
    message: 'LAN 或 Server port 已變更',
    detail: '套用設定需要重新啟動內建前端服務，主畫面會暫時關閉並在服務就緒後重新載入。是否繼續？',
    buttons: ['重新啟動並套用', '取消'],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
  });
  return result.response === 0;
}

async function restoreAfterSettingsFailure(previousSettings, previousWindowState, shouldRestartServer) {
  let restoredUrl = runtimeManager?.getStartUrl() || startUrl;
  if (shouldRestartServer && runtimeManager?.isManagedMode()) {
    restoredUrl = await runtimeManager.restartWithConfig(previousSettings);
  }

  applyLoginItemSettings(previousSettings.openAtLogin);
  currentSettings = saveSettings(getSettingsFilePath(), previousSettings);
  updateStartUrl(restoredUrl);

  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow(
      previousWindowState.frameless,
      previousWindowState.bounds,
      restoredUrl
    );
  }
}

async function saveSettingsFromRenderer(value) {
  const previousSettings = { ...currentSettings };
  const requestedSettings = validateSettings(value);
  const managedMode = Boolean(runtimeManager?.isManagedMode());
  const nextSettings = managedMode
    ? requestedSettings
    : {
        ...requestedSettings,
        networkMode: previousSettings.networkMode,
        serverPort: previousSettings.serverPort,
      };
  const networkChanged = managedMode && (
    nextSettings.networkMode !== previousSettings.networkMode
    || nextSettings.serverPort !== previousSettings.serverPort
  );

  if (networkChanged && !(await confirmManagedServerRestart())) {
    return {
      ok: false,
      cancelled: true,
      settings: getSettingsPayload(previousSettings),
    };
  }

  const previousWindowState = {
    frameless: isMiniMode,
    bounds: mainWindow && !mainWindow.isDestroyed()
      ? mainWindow.getBounds()
      : lastNormalBounds,
  };
  let networkApplied = false;
  isApplyingSettings = true;

  try {
    let nextUrl = runtimeManager?.getStartUrl() || startUrl;
    if (networkChanged) {
      if (isRecovering) {
        closeRecoveryWindow(true);
        resetRecoveryState();
      }
      const previousWindow = mainWindow;
      mainWindow = null;
      destroyWindowSilently(previousWindow);
      nextUrl = await runtimeManager.restartWithConfig(nextSettings);
      networkApplied = true;
      updateStartUrl(nextUrl);
    }

    applyLoginItemSettings(nextSettings.openAtLogin);
    currentSettings = saveSettings(getSettingsFilePath(), nextSettings);

    if (networkChanged) {
      createWindow(previousWindowState.frameless, previousWindowState.bounds, nextUrl);
    }
    refreshTrayMenu();
    return {
      ok: true,
      serverRestarted: networkChanged,
      settings: getSettingsPayload(currentSettings),
    };
  } catch (error) {
    console.error('Failed to apply settings:', error);
    try {
      await restoreAfterSettingsFailure(
        previousSettings,
        previousWindowState,
        networkApplied
      );
    } catch (restoreError) {
      console.error('Failed to restore settings:', restoreError);
      appendSelfCheckLog('settings-rollback-failed', {
        message: error.message,
        rollbackMessage: restoreError.message,
      });
    }
    return {
      ok: false,
      message: error.rollbackError
        ? `無法套用新設定，也無法恢復原服務：${error.rollbackError.message}`
        : `無法套用設定，已恢復原設定：${error.message}`,
      settings: getSettingsPayload(currentSettings),
    };
  } finally {
    isApplyingSettings = false;
  }
}

function registerSettingsIpc() {
  const isSettingsSender = (event) => Boolean(
    settingsWindow
    && !settingsWindow.isDestroyed()
    && event.sender === settingsWindow.webContents
  );

  ipcMain.handle('settings:get', (event) => {
    if (!isSettingsSender(event)) {
      throw new Error('未授權的設定讀取要求。');
    }
    return getSettingsPayload();
  });
  ipcMain.handle('settings:save', async (event, value) => {
    if (!isSettingsSender(event)) {
      throw new Error('未授權的設定儲存要求。');
    }
    return saveSettingsFromRenderer(value);
  });
  ipcMain.handle('settings:cancel', (event) => {
    if (isSettingsSender(event)) {
      settingsWindow.close();
    }
  });
}

function applyPresentationMode(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  isPresentationMode = true;
  isAlwaysOnTop = true;
  const bounds = getPresentationBounds(win);

  Menu.setApplicationMenu(null);
  win.setKiosk(true);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setResizable(false);
  win.setBounds(bounds);
  win.setPosition(bounds.x, bounds.y);
  if (!win.isFullScreen()) {
    win.setFullScreen(true);
  }
  win.focus();
}

function applyGeneralMode(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  isPresentationMode = false;
  isAlwaysOnTop = false;

  if (win.isKiosk()) {
    win.setKiosk(false);
  }
  if (win.isFullScreen()) {
    win.setFullScreen(false);
  }
  win.setAlwaysOnTop(false);
  win.setResizable(true);
  win.setBounds(lastNormalBounds);
  createAppMenu();
}

function setPresentationMode(enabled) {
  isPresentationMode = enabled;
  isAlwaysOnTop = enabled;

  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (enabled) {
    applyPresentationMode(mainWindow);
  } else {
    applyGeneralMode(mainWindow);
  }
}

function restartWindow(frameless = isMiniMode, bounds = null, targetUrl = null) {
  const currentUrl = targetUrl
    || (mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents.getURL() : startUrl)
    || startUrl;

  const previousWindow = mainWindow;
  mainWindow = null;

  destroyWindowSilently(previousWindow);
  createWindow(frameless, bounds, currentUrl);
}

function startSelfCheckRecovery(reason, details = {}) {
  if (isAppQuitting || isRecovering || isApplyingSettings) {
    return;
  }

  appendSelfCheckLog(reason, details);
  monitoringManager?.recordEvent('recovery-triggered', 'Main window recovery watchdog triggered.', {
    reason,
    ...details,
  });

  const targetUrl = mainWindow && !mainWindow.isDestroyed()
    ? mainWindow.webContents.getURL() || startUrl
    : recoveryTargetUrl || startUrl;
  const recoverFrameless = mainWindow && !mainWindow.isDestroyed()
    ? isMiniMode
    : recoveryTargetFrameless;

  recoveryTargetUrl = targetUrl;
  recoveryTargetFrameless = recoverFrameless;
  recoveryReason = reason;
  recoveryDetails = details;
  remainingRecoverySeconds = recoveryCountdownSeconds;
  isRecoveryPaused = false;
  isRecovering = true;

  if (monitoringWindow && !monitoringWindow.isDestroyed()) {
    monitoringWindow.close();
    monitoringWindow = null;
  }

  console.error(`[SelfCheck] ${reason}`, details);

  if (mainWindow && !mainWindow.isDestroyed()) {
    destroyWindowSilently(mainWindow);
    mainWindow = null;
  }

  console.log(`[SelfCheck] Will reopen ${targetUrl} in ${remainingRecoverySeconds} seconds.`);
  createRecoveryWindow();
  startRecoveryCountdown(remainingRecoverySeconds);
}

function reloadCurrentPage() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.reload();
  }
}

function openCurrentDevTools() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function minimizeToTaskbar() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  allowManualMinimize = true;
  mainWindow.minimize();
}

function hideMainWindowToTray() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.hide();
  refreshTrayMenu();
}

async function showPrimaryWindowFromTray() {
  if (recoveryWindow && !recoveryWindow.isDestroyed()) {
    focusWindow(recoveryWindow);
    refreshTrayMenu();
    return;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    focusWindow(mainWindow);
    refreshTrayMenu();
    return;
  }

  if (isRecovering) {
    return;
  }

  try {
    const nextUrl = await resolveAppStartUrl({
      restartManagedServer: runtimeManager?.isManagedMode() || false,
      waitForHealth: true,
    });
    createWindow(isMiniMode, null, nextUrl);
    refreshTrayMenu();
  } catch (error) {
    startSelfCheckRecovery('server-start-failed', {
      phase: 'tray-restore',
      message: error.message,
    });
  }
}

function triggerBrowserCloseWatchdog(source) {
  startSelfCheckRecovery('manual-browser-close', { source });
}

function crashMainWindowRenderer(source) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  console.log(`[CrashTest] Forcing renderer crash from ${source}.`);
  mainWindow.webContents.forcefullyCrashRenderer();
}

function quitApplication(source = 'manual') {
  console.log(`[Quit] Closing application from ${source}.`);
  isAppQuitting = true;
  allowManualMinimize = false;
  clearRecoveryTimers();
  monitoringManager?.shutdown();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.__skipRecovery = true;
  }

  if (monitoringWindow && !monitoringWindow.isDestroyed()) {
    monitoringWindow.close();
  }

  if (recoveryWindow && !recoveryWindow.isDestroyed()) {
    recoveryWindow.__allowClose = true;
  }

  app.quit();
}

function syncMonitoringWindowState() {
  if (!monitoringWindow || monitoringWindow.isDestroyed() || !monitoringManager) {
    return;
  }

  monitoringWindow.webContents.send('monitoring:state', monitoringManager.getSnapshot());
}

function createMonitoringWindow() {
  if (monitoringWindow && !monitoringWindow.isDestroyed()) {
    monitoringWindow.focus();
    syncMonitoringWindowState();
    return monitoringWindow;
  }

  const parentWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined;
  const win = new BrowserWindow({
    width: monitoringWindowBounds.width,
    height: monitoringWindowBounds.height,
    minWidth: 1040,
    minHeight: 640,
    show: false,
    title: '監測系統',
    parent: parentWindow,
    autoHideMenuBar: true,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#eef2f6',
    webPreferences: {
      preload: path.join(__dirname, 'monitoring-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
    win.moveTop();
    syncMonitoringWindowState();
  });
  win.on('closed', () => {
    if (monitoringWindow === win) {
      monitoringWindow = null;
    }
  });
  win.webContents.on('did-finish-load', () => {
    syncMonitoringWindowState();
  });
  win.loadFile(path.join(__dirname, 'monitoring.html'));
  monitoringWindow = win;
  return win;
}

function createAppMenu() {
  const template = [
    {
      label: '系統',
      submenu: [
        {
          label: '設定',
          click: () => createSettingsWindow(),
        },
        {
          label: '監測系統',
          click: () => createMonitoringWindow(),
        },
        {
          label: '觸發自檢重啟',
          click: () => {
            triggerBrowserCloseWatchdog('app-menu');
          },
        },
        {
          label: '離開程式',
          click: () => {
            quitApplication('app-menu');
          },
        },
      ],
    },
    {
      label: '視窗',
      submenu: [
        {
          label: isPresentationMode ? '切到一般模式' : '切到展示模式',
          click: () => {
            setPresentationMode(!isPresentationMode);
          },
        },
        {
          label: '一般模式 720p',
          click: () => {
            lastNormalBounds = { x: 100, y: 100, width: 1280, height: 720 };
            setPresentationMode(false);
          },
        },
        {
          label: '一般模式 1080p',
          click: () => {
            lastNormalBounds = { x: 100, y: 100, width: 1920, height: 1080 };
            setPresentationMode(false);
          },
        },
        {
          label: '最小化到工作列',
          click: () => {
            minimizeToTaskbar();
          },
        },
      ],
    },
    {
      label: '工具',
      submenu: [
        {
          label: '重新載入目前頁面',
          click: () => {
            reloadCurrentPage();
          },
        },
        {
          label: '開啟開發者工具',
          click: () => {
            openCurrentDevTools();
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function buildTrayMenu() {
  const hasMainWindow = Boolean(mainWindow && !mainWindow.isDestroyed());
  const isMainWindowVisible = hasMainWindow && mainWindow.isVisible();
  const hasRecoveryWindow = Boolean(recoveryWindow && !recoveryWindow.isDestroyed());

  return Menu.buildFromTemplate([
    {
      label: '\u986f\u793a\u4e3b\u756b\u9762',
      click: () => {
        void showPrimaryWindowFromTray();
      },
    },
    {
      label: '\u96b1\u85cf\u4e3b\u756b\u9762\u5230\u7cfb\u7d71\u6258\u76e4',
      enabled: hasMainWindow && isMainWindowVisible,
      click: () => {
        hideMainWindowToTray();
      },
    },
    {
      label: '\u6253\u958b\u81ea\u6aa2\u5fa9\u539f\u8996\u7a97',
      enabled: hasRecoveryWindow,
      click: () => {
        focusWindow(recoveryWindow);
      },
    },
    {
      label: '\u6253\u958b\u76e3\u63a7\u9762\u677f',
      click: () => {
        createMonitoringWindow();
      },
    },
    {
      label: '\u8a2d\u5b9a',
      click: () => {
        createSettingsWindow();
      },
    },
    { type: 'separator' },
    {
      label: '\u95dc\u65bc',
      click: () => {
        void showAboutDialog();
      },
    },
    { type: 'separator' },
    {
      label: '\u7d50\u675f\u7a0b\u5f0f',
      click: () => {
        quitApplication('tray-menu');
      },
    },
  ]);
}

function refreshTrayMenu() {
  if (!appTray) {
    return;
  }

  appTray.setContextMenu(buildTrayMenu());
  appTray.setToolTip('ThermalFS');
}

function createTray() {
  if (appTray) {
    refreshTrayMenu();
    return appTray;
  }

  appTray = new Tray(getTrayIconPath());
  appTray.on('click', () => {
    void showPrimaryWindowFromTray();
  });
  appTray.on('double-click', () => {
    void showPrimaryWindowFromTray();
  });
  appTray.on('right-click', () => {
    refreshTrayMenu();
    appTray.popUpContextMenu();
  });
  refreshTrayMenu();
  return appTray;
}

function createContextMenu() {
  const menu = new Menu();

  menu.append(new MenuItem({
    label: '設定',
    click: () => {
      createSettingsWindow();
    },
  }));
  menu.append(new MenuItem({
    label: '監測系統',
    click: () => {
      createMonitoringWindow();
    },
  }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({
    label: isPresentationMode ? '切到一般模式' : '切到展示模式',
    click: () => {
      setPresentationMode(!isPresentationMode);
    },
  }));
  menu.append(new MenuItem({
    label: isMiniMode ? '恢復標準外框' : '切到無邊框模式',
    click: () => {
      const bounds = mainWindow && !mainWindow.isDestroyed()
        ? mainWindow.getBounds()
        : lastNormalBounds;
      isMiniMode = !isMiniMode;
      restartWindow(isMiniMode, bounds);
    },
  }));
  menu.append(new MenuItem({
    label: '最小化到工作列',
    click: () => {
      minimizeToTaskbar();
    },
  }));
  menu.append(new MenuItem({
    label: '重新載入目前頁面',
    click: () => {
      reloadCurrentPage();
    },
  }));
  menu.append(new MenuItem({
    label: '開啟開發者工具',
    click: () => {
      openCurrentDevTools();
    },
  }));
  menu.append(new MenuItem({
    label: '模擬 Renderer Crash',
    click: () => {
      crashMainWindowRenderer('context-menu');
    },
  }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({
    label: '觸發自檢重啟',
    click: () => {
      triggerBrowserCloseWatchdog('context-menu');
    },
  }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({
    label: '關於',
    click: () => {
      void showAboutDialog();
    },
  }));
  menu.append(new MenuItem({
    label: '離開程式',
    click: () => {
      quitApplication('context-menu');
    },
  }));

  return menu;
}

function wireWindowEvents(win) {
  win.__createdAt = Date.now();
  win.__lastDidFinishLoadAt = 0;
  win.__pendingUnresponsiveRecoveryTimer = null;
  win.on('move', () => rememberGeneralBounds(win));
  win.on('resize', () => rememberGeneralBounds(win));
  win.on('show', () => {
    refreshTrayMenu();
  });
  win.on('hide', () => {
    refreshTrayMenu();
  });
  win.on('enter-full-screen', () => {
    Menu.setApplicationMenu(null);
  });
  win.on('leave-full-screen', () => {
    if (!isPresentationMode) {
      createAppMenu();
    }
  });
  win.on('minimize', () => {
    refreshTrayMenu();
    if (allowManualMinimize) {
      allowManualMinimize = false;
      return;
    }

    if (isPresentationMode) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.restore();
          applyPresentationMode(mainWindow);
        }
      }, 0);
    }
  });
  win.on('restore', () => {
    refreshTrayMenu();
  });
  win.on('unresponsive', () => {
    if (!isApplyingSettings) {
      scheduleUnresponsiveRecovery(win);
    }
  });
  win.on('responsive', () => {
    clearPendingUnresponsiveRecovery(win);
  });
  win.on('closed', () => {
    const shouldRecover = !win.__skipRecovery && !isAppQuitting && !isRecovering;

    clearPendingUnresponsiveRecovery(win);

    if (mainWindow === win) {
      mainWindow = null;
    }

    if (shouldRecover) {
      startSelfCheckRecovery('window-closed-unexpectedly');
    }

    refreshTrayMenu();
  });

  win.webContents.on('context-menu', (event) => {
    event.preventDefault();
    createContextMenu().popup();
  });
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools({ mode: 'detach' });
      event.preventDefault();
    }

    if (input.type === 'keyDown' && input.key === 'F5') {
      win.webContents.reload();
      event.preventDefault();
    }
  });
  win.webContents.on('did-finish-load', async () => {
    win.__lastDidFinishLoadAt = Date.now();
    clearPendingUnresponsiveRecovery(win);
    win.webContents.setZoomFactor(1);
    await handleAutoLoginForUrl(win, win.webContents.getURL());
  });
  win.webContents.on('did-navigate', async (_event, url) => {
    console.log('[Navigate]:', url);
    await handleAutoLoginForUrl(win, url);
  });
  win.webContents.on('did-navigate-in-page', async (_event, url) => {
    console.log('[SPA Navigate]:', url);
    await handleAutoLoginForUrl(win, url);
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    if (!isApplyingSettings) {
      startSelfCheckRecovery('render-process-gone', details);
    }
  });
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isApplyingSettings && isMainFrame && errorCode !== -3) {
      startSelfCheckRecovery('did-fail-load', {
        errorCode,
        errorDescription,
        validatedURL,
      });
    }
  });
}

function createWindow(frameless = false, bounds = null, initialUrl = startUrl) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    focusWindow(mainWindow);
    return mainWindow;
  }

  const win = new BrowserWindow({
    width: defaultGeneralBounds.width,
    height: defaultGeneralBounds.height,
    show: false,
    alwaysOnTop: isPresentationMode || isAlwaysOnTop,
    frame: !frameless,
    kiosk: isPresentationMode,
    fullscreenable: true,
    autoHideMenuBar: isPresentationMode,
    resizable: !isPresentationMode,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;
  isMiniMode = frameless;

  if (bounds) {
    win.setBounds(bounds);
  } else if (!isPresentationMode) {
    win.setBounds(lastNormalBounds);
  }

  wireWindowEvents(win);

  win.once('ready-to-show', () => {
    if (isPresentationMode) {
      applyPresentationMode(win);
    } else {
      applyGeneralMode(win);
    }
    win.show();
    refreshTrayMenu();
  });

  if (frameless || isPresentationMode) {
    Menu.setApplicationMenu(null);
  } else {
    createAppMenu();
  }

  win.loadURL(initialUrl);
  refreshTrayMenu();
  return win;
}

function registerMonitoringIpc() {
  ipcMain.handle('monitoring:request-state', () => monitoringManager?.getSnapshot() || null);
  ipcMain.handle('monitoring:save-config', async (_event, patch) => monitoringManager.updateConfig(patch));
  ipcMain.handle('monitoring:set-pause-recording', async (_event, paused) => monitoringManager.setPauseRecording(paused));
  ipcMain.handle('monitoring:set-pause-upload', async (_event, paused) => monitoringManager.setPauseUpload(paused));
  ipcMain.handle('monitoring:manual-send', async () => monitoringManager.manualSendAll());
  ipcMain.handle('monitoring:test-connection', async (_event, remoteUrl) => monitoringManager.testConnection(remoteUrl));
  ipcMain.handle('monitoring:refresh-libraries', async (_event, remoteUrl) => monitoringManager.fetchLibraries(remoteUrl));
  ipcMain.handle('monitoring:create-library', async (_event, payload) => monitoringManager.createRemoteLibrary(payload.name, payload.remoteUrl));
}

if (hasSingleInstanceLock) {
  configureHardwareAcceleration();
  registerGpuLogging();

  app.on('second-instance', () => {
    focusExistingPrimaryWindow();
  });

  app.whenReady().then(async () => {
    registerRecoveryIpc();
    registerSettingsIpc();
    currentSettings = readSettings(getSettingsFilePath(), createDefaultSettings());
    try {
      currentSettings.openAtLogin = getOpenAtLoginState();
      currentSettings = saveSettings(getSettingsFilePath(), currentSettings);
    } catch (error) {
      console.error('Failed to synchronize login item settings:', error);
    }
    migrateLegacySessionData();
    await loadCookies();
    await clearAuthCookieForStartup();
    registerCookiePersistence();
    runtimeManager = new NuxtRuntimeManager({
      app,
      networkMode: currentSettings.networkMode,
      serverPort: currentSettings.serverPort,
      onServerExit: handleManagedServerExit,
      onLog: (message) => {
        console.log(message);
      },
    });
    createTray();

    try {
      const initialUrl = await resolveAppStartUrl({
        restartManagedServer: runtimeManager.isManagedMode(),
        waitForHealth: true,
      });
      createWindow(false, null, initialUrl);
    } catch (error) {
      startSelfCheckRecovery('server-start-failed', {
        phase: 'initial-start',
        message: error.message,
      });
    }

    monitoringManager = new MonitoringManager({
      getMainWindow: () => mainWindow,
      onStateChange: () => syncMonitoringWindowState(),
    });
    registerMonitoringIpc();
    await monitoringManager.init();

    app.on('activate', async () => {
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
      }
      if (recoveryWindow && !recoveryWindow.isDestroyed()) {
        recoveryWindow.focus();
        return;
      }

      if (BrowserWindow.getAllWindows().length === 0 && !isRecovering) {
        try {
          const nextUrl = await resolveAppStartUrl({
            restartManagedServer: runtimeManager?.isManagedMode() || false,
            waitForHealth: true,
          });
          createWindow(isMiniMode, null, nextUrl);
        } catch (error) {
          startSelfCheckRecovery('server-start-failed', {
            phase: 'activate',
            message: error.message,
          });
        }
      }
    });

    globalShortcut.register('F12', () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.webContents.toggleDevTools({ mode: 'detach' });
      }
    });

    app.getGPUFeatureStatus();
  });

  app.on('before-quit', () => {
    isAppQuitting = true;
    clearRecoveryTimers();
    monitoringManager?.shutdown();
    runtimeManager?.markAppQuitting();
    runtimeManager?.stop().catch(() => {});
    appTray?.destroy();
    appTray = null;

    if (recoveryWindow && !recoveryWindow.isDestroyed()) {
      recoveryWindow.__allowClose = true;
    }
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });

  app.on('window-all-closed', () => {
    if (isRecovering || isApplyingSettings) {
      return;
    }

    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    saveCookies().catch(() => {});
    globalShortcut.unregisterAll();
  });
}
