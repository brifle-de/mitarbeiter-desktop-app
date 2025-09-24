
import { LogOptions } from "app/src-electron/log/types";
import { ContextBridge, IpcRenderer } from "electron";

export class LogApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('logApi', {
            writeLog: (opts: LogOptions) => ipcRenderer.invoke('log:writeLog', opts)
        }) 
    }
 }

 export interface LogApiType {
    writeLog: (opts: LogOptions) => Promise<boolean>;    
}
