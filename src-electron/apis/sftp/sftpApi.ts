import { SftpConnection, SftpLsDirResponse } from "app/src-electron/service/SftpConnector";
import { ContextBridge, IpcRenderer } from "electron";

export class SftpApi{ 
     
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){            
        contextBridge.exposeInMainWorld('sftpApi', {
            lsDir: (path: string, connectionOpts: SftpConnection) => ipcRenderer.invoke('sftp:lsDir', path, connectionOpts),
        })  
    }

 }
 export interface SftpApiType {
    lsDir: (path: string, connectionOpts: SftpConnection) => Promise<SftpLsDirResponse|null>; 
    
}