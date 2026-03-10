import AppUpdateService from 'app/src-electron/service/AppUpdateService';
import {  ipcMain, app, BrowserWindow } from 'electron'


export default class ElectronRoutes{

    private appUpdateService: AppUpdateService;

    constructor(appUpdateService: AppUpdateService){
        this.appUpdateService = appUpdateService;
    }

    registerRoutes(){    

        ipcMain.handle('electron:getPlatform', async () => {            
            return process.platform
        })        
        ipcMain.handle('electron:getAppVersion', async () => {  
            return app.getVersion()
        })
        ipcMain.handle('electron:showDevTools', async () => {  
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
                focusedWindow.webContents.openDevTools();
            }
        })
        ipcMain.handle('electron:getUpdateInfo', async () => {  
            return this.appUpdateService.getUpdateInfo();
        })

        ipcMain.handle('electron:downloadAndInstallUpdate', async () => {
            return this.appUpdateService.downloadAndInstallUpdate();
        })

    }

   

   

}

