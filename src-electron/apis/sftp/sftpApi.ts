import { SftpConnection, SftpLsDirResponse } from "app/src-electron/service/SftpConnector";
import { ContextBridge, IpcRenderer } from "electron";

export class SftpApi{ 
     
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){            
        contextBridge.exposeInMainWorld('sftpApi', {
            lsDir: (path: string, connectionOpts: SftpConnection) => ipcRenderer.invoke('sftp:lsDir', path, connectionOpts),
            readFile: (path: string, connectionOpts: SftpConnection, encoding: BufferEncoding) => ipcRenderer.invoke('sftp:readFile', path, connectionOpts, encoding),
        })  
    }

 }
 export interface SftpApiType {
    lsDir: (path: string, connectionOpts: SftpConnection) => Promise<SftpLsDirResponse|null>; 
    readFile: (path: string, connectionOpts: SftpConnection, encoding: BufferEncoding) => Promise<string|null>;
    
}