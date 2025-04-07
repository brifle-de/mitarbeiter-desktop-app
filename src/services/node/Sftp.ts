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



}
