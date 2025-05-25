import { app } from 'electron';
import SftpClient from 'ssh2-sftp-client';
import Files from './Files';
import * as p from 'path';
import fs from 'fs';

export default class SftpConnector {
    /**
     * list directory contents
     * @param path the path to the directory to list
     * @param connectionOpts 
     * @returns 
     */
    static async lsDir(path: string, connectionOpts: SftpConnection): Promise<SftpLsDirResponse | null> {
        const client = new SftpClient();
        return client.connect(connectionOpts)
            .then(() => {
                const data = client.list(path);                
                return data;
            })
            .then((data) => {
                const res :SftpLsDirResponse = {
                    files: [],
                    directories: []
                }
                data.forEach((item) => {                   
                    if (item.type === 'd') {
                        res.directories.push({name: item.name});
                    }
                    else if (item.type === '-') {
                        res.files.push({name: item.name, size: item.size});
                    }                    
                });
                return res;
            })
            .catch(() => {                               
                return null;
            })
            .finally(() => {
                void client.end();
            }
        );
    }     

    /**
     * 
     * @param path the path 
     * @param connectionOpts 
     * @param encoding the encoding to use to read the file, default is 'utf8', binary will return a hex string
     * @returns 
     */
    static async readFile(path: string, connectionOpts: SftpConnection, encoding: BufferEncoding = 'utf8' ): Promise<string | null> {
        const client = new SftpClient();
        // get random tmp file name
        const tmpFileName = `tmp_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.tmp`;
        // get electron tmp dir        
        const destDir = p.join(app.getPath('temp'), "brifle");
        // create tmp dir if it does not exist
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        const dest = p.join(destDir, tmpFileName);
        return client.connect(connectionOpts)
            .then(() => {                
                const options =  {
                    readStreamOptions: {
                        encoding: null
                    }
                }
                return client.get(path,dest,options);
            })
            .then(() => {  
                // read File at dest and return
                return Files.readFile(dest, encoding);
            }).then((data) => {
                // delete tmp file
                fs.unlinkSync(dest);
                return data;
            })
            .catch(() => {                          
                return null;
            })
            .finally(() => {
                void client.end();
            });
    }
    /**
     * Parse a directory name from a path
     * @param path the path to parse
     * @returns the directory name
     */
    static async parseDirname(path: string): Promise<string> {
        return p.dirname(path) + "/"; // in sftp the separator is always a forward slash
    }

    /**
     * Join multiple paths into a single path
     * @param paths the paths to join
     * @returns the joined path
     */
    static async pathJoin(...paths: string[]): Promise<string> {
        // in sftp the separator is always a forward slash
        return paths.join('/').replace(/\/+/g, '/'); // ensure no double slashes
    }
}

export interface SftpLsDirResponse {
    files: {name: string, size: number}[]
    directories: {name: string}[];
}


export interface SftpConnection {
    host: string;
    port: number;
    username: string;
    password: string;
}