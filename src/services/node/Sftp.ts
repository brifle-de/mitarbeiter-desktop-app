import { SftpConnection, SftpLsDirResponse } from "app/src-electron/service/SftpConnector";

export default class Sftp {
  
    /**
     * ls all files and directories in a directory
     * @param path the path to the directory to list
     * @param connectionOpts the connection options to use
     * @returns 
     */
   static async lsDir(path: string, connectionOpts: SftpConnection): Promise<SftpLsDirResponse | null> {
            const serializedOpts = JSON.parse(JSON.stringify(connectionOpts));
           return window.sftpApi.lsDir(path, serializedOpts);   
    }     

    /**
     * read a file and return its content as a string
     * @param path the path to the file to read
     * @param connectionOpts the connection options to use
     * @param encoding the encoding to use to read the file, default is 'utf8', binary will return a hex string
     * @returns 
     */
    static async readFile(path: string, connectionOpts: SftpConnection, encoding: BufferEncoding): Promise<string | null> {
      const serializedOpts = JSON.parse(JSON.stringify(connectionOpts));
      return window.sftpApi.readFile(path, serializedOpts, encoding);
    }



}
