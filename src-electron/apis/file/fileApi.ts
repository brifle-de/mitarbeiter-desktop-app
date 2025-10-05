import { FilePickerOpts, FilesLsDirResponse } from "app/src-electron/service/Files";
import { ContextBridge, IpcRenderer } from "electron";

export class FileApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('fileApi', {
            pickFile: (opts: FilePickerOpts) => ipcRenderer.invoke('files:pickFile', opts),
            readFile: (filePath: string, encoding: BufferEncoding) => ipcRenderer.invoke('files:readFile', filePath, encoding),
            lsDir: (path: string) => ipcRenderer.invoke('files:lsDir', path),
            parseDirname: (path: string) => ipcRenderer.invoke('files:parseDirname', path),
            pathJoin: (...paths: string[]) => ipcRenderer.invoke('files:pathJoin', ...paths)
        }) 
    }
 }
 export interface FileApiType {
    pickFile: (opts: FilePickerOpts) => Promise<string[]>;
    readFile: (filePath: string, encoding: BufferEncoding) => Promise<string>;
    lsDir: (path: string) => Promise<FilesLsDirResponse | null>;
    parseDirname: (path: string) => Promise<string>;
    pathJoin: (...paths: string[]) => Promise<string>;
    
}