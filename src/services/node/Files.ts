import { FilePickerOpts, FilesLsDirResponse } from "app/src-electron/service/Files";

export default class Files {
    /**
     * picks a file using electron node dialog and returns the full paths of the selected files
     * @param opts - File picker options
     * @returns 
     */
    static async pickFile(opts: FilePickerOpts): Promise<string[]> {
        return window.fileApi.pickFile(opts); 
    }

    /**
     * Read a file and return its content as a string
     * @param filePath the path to the file to read
     * @returns the content of the file as a string
     */
    static async readFile(filePath: string, encoding: BufferEncoding): Promise<string> {
        return window.fileApi.readFile(filePath, encoding); 
    }

    /**
     * Read a directory and return its content as an array of files and directories
     * @param path the path to the directory to read
     * @returns the content of the directory as an array of files and directories
     */
    static async lsDir(path: string): Promise<FilesLsDirResponse | null> {
        return window.fileApi.lsDir(path); 
    }

    
}