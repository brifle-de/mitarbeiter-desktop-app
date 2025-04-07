
import SftpConnector, { SftpConnection } from 'app/src-electron/service/SftpConnector'
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export default class SftpRoutes{

    registerRoutes(){          

        ipcMain.handle('sftp:lsDir', async (event: IpcMainInvokeEvent, path: string, opts: SftpConnection) => {            
            return SftpConnector.lsDir(path, opts)
        })
        
    }

}