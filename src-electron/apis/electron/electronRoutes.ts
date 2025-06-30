import {  ipcMain, app } from 'electron'


export default class ElectronRoutes{

    registerRoutes(){    

        ipcMain.handle('electron:getPlatform', async () => {            
            return process.platform
        })        
        ipcMain.handle('electron:getAppVersion', async () => {            
            console.log('getAppVersion called', app.getVersion())
            return app.getVersion()
        })

    }

   

}

