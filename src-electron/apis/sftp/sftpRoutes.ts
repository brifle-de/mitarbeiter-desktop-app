
import SftpConnector, { SftpConnection } from 'app/src-electron/service/SftpConnector'
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export default class SftpRoutes{

    registerRoutes(){          

        ipcMain.handle('sftp:lsDir', async (event: IpcMainInvokeEvent, path: string, opts: SftpConnection) => {            
            return SftpConnector.lsDir(path, opts)
        })
        ipcMain.handle('sftp:readFile', async (event: IpcMainInvokeEvent, path: string, opts: SftpConnection, encoding: BufferEncoding) => {            
            return SftpConnector.readFile(path, opts, encoding)
        })
        ipcMain.handle('sftp:parseDirname', async (event: IpcMainInvokeEvent, path: string) => {            
            return SftpConnector.parseDirname(path)
        })
        ipcMain.handle('sftp:pathJoin', async (event: IpcMainInvokeEvent, ...paths: string[]) => {            
            return SftpConnector.pathJoin(...paths) // Join the paths using the platform-specific separator
        })
        
    }

}