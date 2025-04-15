import { dialog } from "electron";
import fs from 'fs';

export default class Files {


    /**
     * picks a file using electron node dialog and returns the full paths of the selected files
     * @param opts - File picker options
     * @returns 
     */
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
    static async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        // if encoding is binary return as hex string
        if(encoding === 'binary') {
            return fs.readFileSync(filePath, 'hex');
        }
        return fs.readFileSync(filePath, encoding);
    }

    /**
     * Read a directory and return its content as an array of files and directories
     * @param path the path to the directory to read
     * @returns the content of the directory as an array of files and directories
     */
    static async lsDir(path: string): Promise<FilesLsDirResponse | null> {
        // check if path exists
        if (!fs.existsSync(path)) {
            return null;
        }
        // read locales
        const files = fs.readdirSync(path);
        const res: FilesLsDirResponse = {
            files: [],
            directories: []
        };
        // add entry depending on the type of file
        for (const file of files) {
            const filePath = `${path}/${file}`;
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                res.directories.push({ name: file });
            } else if (stat.isFile()) {
                res.files.push({ name: file, size: stat.size });
            }
        }
        return res;
    }
    
}

export interface FilePickerOpts {
    title?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles')[];
}

export interface FilesLsDirResponse {
    files: {name: string, size: number}[]
    directories: {name: string}[];
}
