import { createWorker, OEM } from 'tesseract.js';

import path from 'node:path';
import { app } from 'electron';
import { getAppDirectoryName } from '../const/AppConst';
import { OrcDocumentAnalysisResult } from '../apis/ocr/ocrApi';
import DocumentAnalyser from './ocr/DocumentAnalyser';

export default class OcrService{

    getHomeDirectoryPath() {
        const homeDir = app.getPath('home');
        const appDataDir = path.join(homeDir, getAppDirectoryName());
        return appDataDir;
    }

    async performOcrOnBase64Data(base64Data: string) {
        const ocrDataPath = path.join(this.getHomeDirectoryPath(), 'ocr_data');
        const worker = await createWorker(
            ["deu"],
            OEM.DEFAULT,
            {
                langPath: ocrDataPath,
                cachePath: ocrDataPath,
            }                           
        );
        const ret = await worker.recognize(base64Data);
        await worker.terminate();
        return ret.data.text;
          
    }

    /**
     * analyse document with multiple pages. each page is represented as a base64 string in the input array. Each base64 string represents an image of a page. The method should return a structured result containing the extracted information from all pages.
     * 
     * @param pagesBase64Data the 
     */
    async performDocumentAnalysisOnBase64Data(pagesBase64Data: string[]) : Promise<OrcDocumentAnalysisResult> {
        const ocrDataPath = path.join(this.getHomeDirectoryPath(), 'ocr_data');
        const worker = await createWorker(
            ["deu"],
            OEM.DEFAULT,
            {
                langPath: ocrDataPath,
                cachePath: ocrDataPath,
            }                           
        );
        let fullText = "";
        for (const base64Data of pagesBase64Data) {
            const ret = await worker.recognize(base64Data);
            fullText += ret.data.text + "\n";
        } 
        await worker.terminate();
        const documentAnalyser = new DocumentAnalyser();
        const type = documentAnalyser.checkDocumentType(fullText);
        console.log(`Document type detection result: ${JSON.stringify(type)}`);
        const invoiceNumberDetection = documentAnalyser.extractInvoiceNumber(fullText);
        



        // find ibans
        const ibanRegex = /([A-Z]{2}\d{2}([ ]?[0-9]{1,30}){1,6})/g;
        
        const ibans = [];

        for(let match; (match = ibanRegex.exec(fullText)) !== null; ) {
            const iban = match[0].replace(/\s/g, ''); // remove spaces from IBAN
            if (iban.length >= 15 && iban.length <= 34) { // IBAN length check
                ibans.push(iban);
            }
        }

        const getEURAmountRegex = [
            /€\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g, 
            /EUR\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g
        ];
        const amounts : string[] = [];
        let matchAmount;
        for (const regex of getEURAmountRegex) {
            while ((matchAmount = regex.exec(fullText)) !== null) {
                amounts.push(matchAmount[1]!);
            }
        }
        const invoiceDetection = {
            amounts: amounts,
            ibans: ibans,
            invoiceNumber:  invoiceNumberDetection
        }

        /**
         * Rechnungsnummer: Nummer
         * Rechnung # Nummer
         * Invoice Number: Nummer
         * Invoice #: Nummer
         * 
         */



        return { raw: fullText, typeDetection: type, invoiceDetection: invoiceDetection };
    }

}