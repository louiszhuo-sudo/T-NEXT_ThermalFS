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

`pack:win` produces `pack/ThermalFS.exe` and `pack/ThermalFS Setup 1.0.16.exe`. The NSIS installer includes a Windows sign-in startup option; the portable build can configure the same behavior from the in-app settings window.

### Automated per-user installation

The NSIS installer supports an explicit per-user startup override for remote automation:

```powershell
$installer = "C:\path\to\ThermalFS Setup <version>.exe"
$process = Start-Process -FilePath $installer `
  -ArgumentList "/S", "/currentuser", "--force-run", "/THERMALFS_AUTOSTART=1" `
  -Wait -PassThru
$process.ExitCode
```

Use `/THERMALFS_AUTOSTART=1` to create the current user's ThermalFS startup entry, or `/THERMALFS_AUTOSTART=0` to remove it explicitly. This option is accepted only with `/S /currentuser`; invalid values, interactive use, or combining it with `/allusers` exits with code `10` before installation. Keep `/THERMALFS_AUTOSTART=0|1` as the final argument. `--force-run` launches ThermalFS after a successful silent install; omit it when the application should remain closed.

When `/THERMALFS_AUTOSTART` is omitted, the interactive startup checkbox and the existing install/upgrade behavior are unchanged.

Recommended checks after an enabled install:

```powershell
(Get-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run").GetValue("com.yst.thermalfs.donghe")
Get-Process ThermalFS -ErrorAction SilentlyContinue
Invoke-RestMethod "http://127.0.0.1:3000/api/health"
```

Recommended check after installing with `/THERMALFS_AUTOSTART=0`:

```powershell
$null -eq (Get-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run").GetValue("com.yst.thermalfs.donghe")
```

### v1.0.16 silent-install validation

The command `/S /currentuser --force-run /THERMALFS_AUTOSTART=1` was validated on Windows with the following results:

- Installer exit code `0`; installation completed in about 209.4 seconds.
- Per-user installation at `%LOCALAPPDATA%\Programs\thermalfs-donghe\ThermalFS.exe` with file version `1.0.16` and product version `1.0.16.0`.
- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\com.yst.thermalfs.donghe` exactly matched the installed executable path.
- `ThermalFS.exe` launched after installation; bundled `resources\runtime\node.exe` listened on port `3000`; `GET http://127.0.0.1:3000/api/health` returned HTTP `200` with `status=ok`.

Packaged account data is initialized from `apps/nuxt/auth.json` and stored in the Electron user data directory. The monitoring panel starts with recording and upload paused.

Before the first local build, copy `apps/nuxt/auth.example.json` to `apps/nuxt/auth.json` and replace the placeholder credentials. The real `auth.json` and local TLS certificates are excluded from Git.
