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


## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Build the app for production
```bash
quasar build -m electron
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
