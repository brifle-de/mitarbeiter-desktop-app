import { createWorker, OEM } from 'tesseract.js';

import path from 'node:path';
import { app } from 'electron';
import { getAppDirectoryName } from '../const/AppConst';

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

}