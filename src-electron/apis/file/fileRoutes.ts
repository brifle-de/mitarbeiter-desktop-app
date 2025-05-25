import Files, { FilePickerOpts } from 'app/src-electron/service/Files'
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import p from 'path';

export default class FileRoutes{

    registerRoutes(){          

        ipcMain.handle('files:pickFile', async (event: IpcMainInvokeEvent, opts: FilePickerOpts) => {            
            return Files.pickFile(opts)
        })
        ipcMain.handle('files:readFile', async (event: IpcMainInvokeEvent, filePath: string, encoding: BufferEncoding) => {            
            return Files.readFile(filePath, encoding)
        })
        ipcMain.handle('files:lsDir', async (event: IpcMainInvokeEvent, path: string) => {            
            return Files.lsDir(path)
        })
        ipcMain.handle('files:parseDirname', async (event: IpcMainInvokeEvent, path: string) => {            
            return p.join(p.dirname(path), "/") // Ensure the path is absolute and ends with a separator
        })
        ipcMain.handle('files:pathJoin', async (event: IpcMainInvokeEvent, ...paths: string[]) => {            
            return p.join(...paths) // Join the paths using the platform-specific separator
        })
        
    }

}