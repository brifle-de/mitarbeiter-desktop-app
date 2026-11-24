 
import type { UpdateChannel, UpdateInformation, UpdateStatus } from "app/src-electron/service/AppUpdateService";
import { ContextBridge, IpcRenderer } from "electron";

 export class ElectronApi{
    
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('electronApi', {
            getPlatform: () => ipcRenderer.invoke('electron:getPlatform'),          
            getAppVersion: () => ipcRenderer.invoke('electron:getAppVersion'),
            showDevTools: () => ipcRenderer.invoke('electron:showDevTools'),
            getUpdateInfo: () => ipcRenderer.invoke('electron:getUpdateInfo'),
            downloadAndInstallUpdate: () => ipcRenderer.invoke('electron:downloadAndInstallUpdate'),
            getUpdateStatus: () => ipcRenderer.invoke('electron:getUpdateStatus'),
            setUpdateChannel: (channel: UpdateChannel) => ipcRenderer.invoke('electron:setUpdateChannel', channel),
            checkForUpdates: () => ipcRenderer.invoke('electron:checkForUpdates'),
        })
    }

 }
 export interface ElectronApiType {
    getPlatform: () => Promise<string>;
    getAppVersion: () => Promise<string>;
    showDevTools: () => Promise<void>;
    getUpdateInfo: () => Promise<UpdateInformation  | null>;
    downloadAndInstallUpdate: () => Promise<void>;
    getUpdateStatus: () => Promise<UpdateStatus>;
    setUpdateChannel: (channel: UpdateChannel) => Promise<UpdateStatus>;
    checkForUpdates: () => Promise<UpdateStatus>;
}