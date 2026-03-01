import ScriptsService from 'app/src-electron/service/ScriptsService'
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export default class ScriptsRoutes{

    readonly scriptService = new ScriptsService();

    registerRoutes(){          

        ipcMain.handle('scripts:getSupportedScriptEnvironments', async () => {            
            return this.scriptService.checkSupportedEnvironments()
        })
        ipcMain.handle('scripts:getAvailableScripts', async (_event: IpcMainInvokeEvent, env: string) => {            
            return this.scriptService.getAvailableScripts(env)
        })
        ipcMain.handle('scripts:getAllScriptExtensions', async () => {            
            return this.scriptService.supportedScriptExtensions
        })
        ipcMain.handle('scripts:executeScript', async (event: IpcMainInvokeEvent, env: string, scriptName: string, args?: string[]) => {            
            return this.scriptService.executeScript(env, scriptName, args)
        })
        ipcMain.handle('scripts:readScriptContent', async (event: IpcMainInvokeEvent, env: string, scriptName: string) => {            
            return this.scriptService.readScriptContent(env, scriptName)
        })
        
    }

}