import { ContextBridge, IpcRenderer } from "electron";


export class OcrApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('ocrApi', {
            performOcrBase64Data: (base64: string) => ipcRenderer.invoke('ocr:performOcrBase64Data', base64),
             
        }) 
    }

 }


  export interface OcrApiType {
    performOcrBase64Data(base64: string): Promise<string>;
}