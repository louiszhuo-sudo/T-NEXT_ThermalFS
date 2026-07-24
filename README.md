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

Both the web development server and packaged desktop runtime bind to `0.0.0.0:3000` by default so other computers on the LAN can open `http://<server-ip>:3000`. Electron itself still connects through `http://127.0.0.1:3000`. Set `THERMALFS_NETWORK_MODE=local` to restrict access to this computer, or `THERMALFS_SERVER_PORT` to override the port. Windows Firewall must also allow inbound TCP traffic on the selected port.

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

`pack:win` produces `pack/ThermalFS.exe` and `pack/ThermalFS Setup 1.0.9.exe`.

Packaged account data is initialized from `apps/nuxt/auth.json` and stored in the Electron user data directory. The monitoring panel starts with recording and upload paused.

Before the first local build, copy `apps/nuxt/auth.example.json` to `apps/nuxt/auth.json` and replace the placeholder credentials. The real `auth.json` and local TLS certificates are excluded from Git.
