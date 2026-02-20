

import {  ipcMain } from 'electron'
import OcrService from 'app/src-electron/service/OcrService';

export default class OcrRoutes{

    readonly ocrService = new OcrService();
 

    registerRoutes(){          
        ipcMain.handle('ocr:performOcrBase64Data', async (event, base64Data: string) => {
            // Implement your OCR logic here
            // For example, you might call an OCR service or library
            const ocrResult = await this.ocrService.performOcrOnBase64Data(base64Data);
            return ocrResult;
        })
        ipcMain.handle('ocr:performDocumentAnalysisBase64Data', async (event, base64DataPages: string[]) => {
            // Implement your OCR logic here
            // For example, you might call an OCR service or library
            const ocrResult = await this.ocrService.performDocumentAnalysisOnBase64Data(base64DataPages);
            return ocrResult;
        })
    }


}