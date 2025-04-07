import { FilePickerOpts } from "app/src-electron/service/Files";
import { ContextBridge, IpcRenderer } from "electron";

export class FileApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('fileApi', {
            pickFile: (opts: FilePickerOpts) => ipcRenderer.invoke('files:pickFile', opts),
            readFile: (filePath: string) => ipcRenderer.invoke('files:readFile', filePath)
        }) 
    }

 }
 export interface FileApiType {
    pickFile: (opts: FilePickerOpts) => Promise<string[]>;
    readFile: (filePath: string) => Promise<string>;
    
}