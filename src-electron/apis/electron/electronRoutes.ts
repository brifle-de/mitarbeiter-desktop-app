import {  ipcMain, app } from 'electron'


export default class ElectronRoutes{

    registerRoutes(){    

        ipcMain.handle('electron:getPlatform', async () => {            
            return process.platform
        })        
        ipcMain.handle('electron:getAppVersion', async () => {  
            return app.getVersion()
        })

    }

   

}

