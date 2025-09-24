
import { LogOptions } from 'app/src-electron/log/types';
import LogService from 'app/src-electron/service/LogService';
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'


export default class LogRoutes{

    registerRoutes(){         
        ipcMain.handle('log:writeLog', async (event: IpcMainInvokeEvent, opts: LogOptions) => {            
            return LogService.writeLog(opts)
        });               
        
    }



}