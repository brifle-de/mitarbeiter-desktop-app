import { app, BrowserWindow  } from 'electron';
import path from 'node:path';
import os from 'os';
import { fileURLToPath } from 'url'
import { registerRoutes } from './apis/routes';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform(); 

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;

async function createWindow() {

  const titleBarOverlayWindow = {
    color: '#151b11',
    symbolColor: '#74be97',
    height: 36 
  }

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 700,
    fullscreenable: true,
    // remove the default titlebar
    titleBarStyle: 'hidden',    
    useContentSize: true,
     // expose window controlls in Windows/Linux
     ...(process.platform !== 'darwin' ? { titleBarOverlay: titleBarOverlayWindow } : {}),     
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      sandbox: true,
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      ),
    },
  });

  // full size by default
  mainWindow.maximize();

  

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

void app.whenReady().then(() => {
  registerRoutes();
  void createWindow();
 
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});
