import {  ipcMain, app, BrowserWindow } from 'electron'


export default class ElectronRoutes{

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

    }

   

}

