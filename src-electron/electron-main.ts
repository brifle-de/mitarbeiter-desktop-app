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

import ipp from 'ipp';
import bonjour from 'bonjour';
import http from 'http';


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

function createPrinter(){
  const outputDir = "./ipp_output";
  fs.mkdirSync(outputDir, { recursive: true });
  const server = http.createServer((req, res) => {

  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end();
  }

  const buffers : Buffer[] = [];

  req.on("data", chunk => buffers.push(chunk));

  req.on("end", () => {

    const body = Buffer.concat(buffers);

    // decode IPP message
    const msg = ipp.parse(body);

    const operation = msg.operation;

    console.log("IPP operation:", operation);

    if (operation === "Print-Job") {

      const pdf = msg.data; // print data

      const file = path.join(outputDir, `job-${Date.now()}.pdf`);
      fs.writeFileSync(file, pdf);

      console.log("Saved job:", file);
    }else if(operation === "Get-Printer-Attributes") {
      console.log("Received Get-Printer-Attributes request");
      const printerUrl = "ipp://localhost:9631/ipp/print"
      // Handle Get-Printer-Attributes operation

      const response = ipp.serialize({
        version: "2.0",
        statusCode: "successful-ok",
        requestId: msg.id,
        printerAttributes: {
          "printer-name": "Electron Printer",
          "printer-uri-supported": printerUrl,
          "printer-state": 3,
          "printer-state-reasons": "none",
          "ipp-versions-supported": ["2.0"],
          "operations-supported": [
            "Print-Job",
            "Validate-Job",
            "Get-Printer-Attributes"
          ],
          "document-format-supported": [
            "application/pdf",
            "application/postscript"
          ]
        }
      });
     

    res.writeHead(200, {
      "Content-Type": "application/ipp"
    });

    res.end(response);
    return;

    }

    const response = ipp.serialize({
      statusCode: "successful-ok"
    });

    res.writeHead(200, {
      "Content-Type": "application/ipp"
    });

    res.end(response);
});

});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.warn('IPP printer port 9631 already in use; skipping printer startup.');
  } else {
    console.error('IPP printer server error:', err);
  }
});

server.listen(9631, () => {
  console.log("IPP printer running on port 631");
  const mdns = bonjour();
  const service = mdns.publish({
  name: "Brifle Virtual Printer",
  type: "ipp",
  protocol: "tcp",
  port: 9631,
  txt: {
    ty: "My Virtual Printer",
    note: "Local Electron printer",
    pdl: "application/pdf",
    rp: "ipp/print"
  }
});
service.start();
 console.log("IPP printer running on port 631");
});
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
  // start the IPP printer only in the instance that holds the single-instance lock
  createPrinter();
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
