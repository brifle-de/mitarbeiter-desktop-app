import { dialog } from "electron";
import fs from 'fs';

export default class Files {

    static async pickFile(opts : FilePickerOpts): Promise<string[]> {
        const result = await dialog.showOpenDialog({
            properties: opts.properties || ['openFile'],
            filters: opts.filters || [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        return result.canceled ? [] : result.filePaths;
    }

    /**
     * Read a file and return its content as a string
     * @param filePath the path to the file to read
     * @returns the content of the file as a string
     */
    static async readFile(filePath: string): Promise<string> {
        const file = fs.readFileSync(filePath, 'utf-8');
        return file;
    }
    
}

export interface FilePickerOpts {
    title?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles')[];
}