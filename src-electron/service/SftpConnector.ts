import SftpClient from 'ssh2-sftp-client';

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