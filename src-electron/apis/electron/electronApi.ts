 
import { ContextBridge, IpcRenderer } from "electron";

 export class ElectronApi{
    
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('electronApi', {
            getPlatform: () => ipcRenderer.invoke('electron:getPlatform'),          
            getAppVersion: () => ipcRenderer.invoke('electron:getAppVersion'),
            showDevTools: () => ipcRenderer.invoke('electron:showDevTools')
        })
    }

 }
 export interface ElectronApiType {
    getPlatform: () => Promise<string>;
    getAppVersion: () => Promise<string>;
    showDevTools: () => Promise<void>;
}