import AppUpdateService, { type UpdateChannel } from 'app/src-electron/service/AppUpdateService';
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

        ipcMain.handle('electron:getUpdateStatus', async () => {
            return this.appUpdateService.getStatus();
        })

        ipcMain.handle('electron:setUpdateChannel', async (_event, channel: UpdateChannel) => {
            return this.appUpdateService.setChannel(channel === 'test' ? 'test' : 'stable');
        })

        ipcMain.handle('electron:checkForUpdates', async () => {
            await this.appUpdateService.refresh();
            return this.appUpdateService.getStatus();
        })

    }

   

   

}

