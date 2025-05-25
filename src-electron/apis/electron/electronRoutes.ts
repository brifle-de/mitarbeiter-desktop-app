import {  ipcMain } from 'electron'


export default class ElectronRoutes{

    registerRoutes(){    

        ipcMain.handle('electron:getPlatform', async () => {            
            return process.platform
        })        

    }

   

}

