# ThermalFS Donghe Desktop

This workspace contains the existing Donghe Nuxt application and the ThermalFS Electron desktop runtime.

## Structure

- `apps/nuxt`: Nuxt application source, server APIs, assets, and default `auth.json`.
- `apps/electron`: Electron main process, desktop windows, recovery watchdog, and monitoring client.
- `scripts`: Nuxt, Electron development, staging, and Windows packaging runners.
- `.desktop`: Generated packaged-server staging directory.
- `pack`: Generated portable and NSIS Windows artifacts.

Dependencies are installed once at the workspace root.

## Development

```powershell
npm install
npm run dev:web
```

Both the web development server and packaged desktop runtime bind to `0.0.0.0:3000` by default so other computers on the LAN can open `http://<server-ip>:3000`. Electron itself still connects through `http://127.0.0.1:3000`.

In the packaged application, open **設定** from the main-window context menu, application menu, or system tray to configure:

- Start ThermalFS when the current user signs in to Windows.
- Allow LAN access (`0.0.0.0`) or restrict the server to this computer (`127.0.0.1`).
- Select the bundled frontend server port (`1`–`65535`).

Changing LAN access or the port asks for confirmation, restarts only the bundled Nuxt server, and reloads the main window. Settings are stored in Electron's per-user `userData/settings.json`. Windows Firewall must separately allow inbound TCP traffic on the selected port; ThermalFS does not modify firewall rules.

For development and first-run defaults, set `THERMALFS_NETWORK_MODE=local` to restrict access to this computer or `THERMALFS_SERVER_PORT` to override the default port. `ELECTRON_START_URL` continues to select an external server; LAN and port settings are disabled in that mode.

```powershell
npm run electron:dev
```

`electron:dev` starts Nuxt, waits for `/api/health`, and then opens ThermalFS. Use `npm run dev:electron` to open Electron against an already-running URL configured by `ELECTRON_START_URL`.

## Build

```powershell
npm run build:web
npm run build:desktop
npm run pack:win
```

`pack:win` produces `pack/ThermalFS.exe` and `pack/ThermalFS Setup 1.0.15.exe`. The NSIS installer includes a Windows sign-in startup option; the portable build can configure the same behavior from the in-app settings window.

Packaged account data is initialized from `apps/nuxt/auth.json` and stored in the Electron user data directory. The monitoring panel starts with recording and upload paused.

Before the first local build, copy `apps/nuxt/auth.example.json` to `apps/nuxt/auth.json` and replace the placeholder credentials. The real `auth.json` and local TLS certificates are excluded from Git.
