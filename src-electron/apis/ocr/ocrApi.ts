import { ContextBridge, IpcRenderer } from "electron";


export class OcrApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('ocrApi', {
            performOcrBase64Data: (base64: string) => ipcRenderer.invoke('ocr:performOcrBase64Data', base64),
            performDocumentAnalysisBase64Data: (base64: string[]) => ipcRenderer.invoke('ocr:performDocumentAnalysisBase64Data', base64)
             
        }) 
    }


 }


  export interface OcrApiType {
    performOcrBase64Data(base64: string): Promise<string>;
    performDocumentAnalysisBase64Data(base64: string[]): Promise<OrcDocumentAnalysisResult>;
}

export interface OrcDocumentAnalysisResult {
    raw: string;
    typeDetection: { [categoryName: string]: {
        score: number;
        isMatch: boolean;
    }};
    invoiceDetection?: {
        amounts: string[];
        invoiceNumber: string;
        ibans: string[];
    }
}