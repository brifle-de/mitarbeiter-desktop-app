> [!WARNING] 
> Disclaimer: Early Access to the Software. Development is still in process and in early stages. Moreover, the project may get discontinued at any time. Use at your own risk.

# Brifle Mitarbeiter App

This Application is a Desktop Application that wrapps around the [Brifle API](https://developer.brifle.de/docs/api/brifle). Its intention is to use simple features of the Brifle API with native features such local file system access.

# Configuration of Logging

You can modify the ~/brifle-business/logs/logger-config.json file to change the logging level. The default level is "info". You can set it to "debug" for more detailed logs or reduce it to "error" to log only errors.

For windows ~ = C:\Users\YourUsername

```json
{
  "level": "info",
  "filePath": "app.log",
  "logDir": "C:\\Users\\YourUsername\\brifle-business\\logs"
}
```

# App Directory and On Rest Encryption

All local files are stored in the user home directory under `~/brifle-business`. This includes configuration files, logs, and any other data the application needs to store locally. Account data is stored in an encrypted format using a password to generate the encryption key.


## Development

Electron + Vue 3 with [OpenVue](https://openvue.dev) (PrimeVue fork), Tailwind CSS 4 and electron-vite.
The design is the Figma file "Mitarbeiter – Brifle App"; how Quasar parts map to the new
components is in [docs/quasar-openvue-map.md](docs/quasar-openvue-map.md).

```bash
npm ci
npm run dev            # app with hot reload (data folder ~/brifle-business-dev)
npm run lint
npm run typecheck
npm run test:unit:ci
npm run build          # bundles main, preload and renderer into out/
npm run build:linux    # installers into dist/electron/Packaged (also build:win, build:mac)
```

Installer settings (app id, targets, signing) are in `electron-builder.yml`.

## Releases and updates

Releases are built by GitHub Actions from `release/X.Y` branches and published as GitHub
Releases; installed apps update themselves from there (release candidates only with the
Testkanal switched on). See [.github/RELEASE.md](.github/RELEASE.md).
