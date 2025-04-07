import Files, { FilePickerOpts } from 'app/src-electron/service/Files'
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export default class FileRoutes{

    registerRoutes(){          

        ipcMain.handle('files:pickFile', async (event: IpcMainInvokeEvent, opts: FilePickerOpts) => {            
            return Files.pickFile(opts)
        })
        ipcMain.handle('files:readFile', async (event: IpcMainInvokeEvent, filePath: string) => {            
            return Files.readFile(filePath)
        })
        
    }

}