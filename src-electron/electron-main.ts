import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'node:path';
import os from 'os';
import { fileURLToPath } from 'url'
import { registerRoutes } from './apis/routes';
import fs from 'fs';
import { ensureConfig } from './log/logger';
import PipeSocketService from './service/PipeSocketService';
import { getAppDirectoryName, AppPipeName } from "./const/AppConst";
import ParsersService from './service/ParsersService';
import ScriptsService from './service/ScriptsService';
import BulkSendTemplateService from './service/BulkSendTemplateService';

import AppUpdateService from './service/AppUpdateService';



// needed in case process is undefined under Linux
const platform = process.platform || os.platform(); 

const appUpdateService = new AppUpdateService();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;
let tray: Tray | null = null;
let isQuiting = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();   // Prevent second instance from starting  
} else {
  app.on('second-instance', () => {   
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
    }
  });
  initApp();
}


function initApp(){
  // init home directory for the app
  const homeDir = app.getPath('home');
  const appDataDir = path.join(homeDir, getAppDirectoryName());
  const parsersService = new ParsersService();
  const scriptsService = new ScriptsService();
  const sendTemplateService = new BulkSendTemplateService();
  const pipeSocketService = new PipeSocketService(AppPipeName);
  // check if directory exists
  if (!fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir, { recursive: true });
  }  
  // initialize parsers directory
  parsersService.initDirectory();
  // checks if logs.config file exist if not create
  ensureConfig();
  pipeSocketService.init();
  copyOcrFiles(appDataDir); 
  scriptsService.initScriptsDirectory();
  sendTemplateService.initTemplatesDirectory();
  appUpdateService.registerUpdateEvents();
  void appUpdateService.refresh();
}


function getBundledTessdataPath(): string {
  if (app.isPackaged) {
    // production (inside app bundle)
    return path.join(
      process.resourcesPath,
      "ocr_data",
    );
  }

  // dev (filesystem)
  return path.join(
    process.cwd(),
    "src-electron",
    "ocr_data"
  );

}





function copyOcrFiles(appDataDir: string){
  const tessdataSourceDir = getBundledTessdataPath();
  const tessdataTargetDir = path.join(appDataDir, "ocr_data");
  if (!fs.existsSync(tessdataTargetDir)) {
    fs.mkdirSync(tessdataTargetDir, { recursive: true });
  }
  fs.readdir(tessdataSourceDir, (err, files) => {
    if (err) {
      console.error("Error reading tessdata source directory:", err);
      return;
    }
    files.forEach(file => {
      const sourcePath = path.join(tessdataSourceDir, file);
      const targetPath = path.join(tessdataTargetDir, file);
      fs.copyFile(sourcePath, targetPath, (copyErr) => {
        if (copyErr) {
          console.error(`Error copying ${file}:`, copyErr);
        } else {
          console.log(`Copied ${file} to ${targetPath}`);
        }
      });
    });
  });
}


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

  

  mainWindow.on('close', (event: { preventDefault: () => void; }) => {
     if (mainWindow && !isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
  });
  
}

const getTrayIcon = () => {
  if (process.env.DEV) {
    return path.join(process.cwd(), 'public/icons/icon.ico')
  } else {
    return path.join(process.resourcesPath, 'icons/icon.ico')
  }
}

function createTray() {

  
  tray = new Tray(getTrayIcon()) // Windows prefers .ico
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'App anzeigen',
      click: () => mainWindow?.show()
    },
    {
      label: 'Schließen',
      click: () => {
        isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Brifle Business App')
  tray.setContextMenu(trayMenu)

  tray.on('click', () => {
    mainWindow?.show() // Left click restores your window
  })
}


void app.whenReady().then(() => {
  registerRoutes(appUpdateService);  
  void createWindow(); 
  void createTray();
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
