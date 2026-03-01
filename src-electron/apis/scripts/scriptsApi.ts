import { ContextBridge, IpcRenderer } from "electron";

export class ScriptsApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('scriptsApi', {
            getSupportedScriptEnvironments: () => ipcRenderer.invoke('scripts:getSupportedScriptEnvironments'),
            getAvailableScripts: (env: string) => ipcRenderer.invoke('scripts:getAvailableScripts', env),
            getAllScriptExtensions: () => ipcRenderer.invoke('scripts:getAllScriptExtensions'),
            executeScript: (env: string, scriptName: string, args?: string[]) => ipcRenderer.invoke('scripts:executeScript', env, scriptName, args),
            readScriptContent: (env: string, scriptName: string) => ipcRenderer.invoke('scripts:readScriptContent', env, scriptName)
        }) 
    }
 }
 export interface ScriptsApiType {
    getSupportedScriptEnvironments: () => Promise<{name: string, version: string, installed: boolean}[]>;
    getAvailableScripts: (env: string) => Promise<string[]>;
    getAllScriptExtensions: () => Promise<string[]>;
    executeScript: (env: string, scriptName: string, args?: string[]) => Promise<{ success: boolean, output: string }>;
    readScriptContent: (env: string, scriptName: string) => Promise<string>;
    
}