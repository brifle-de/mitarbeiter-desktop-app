import { SftpData } from "app/src-electron/models/EncryptedStore";

export default interface DocumentRecord extends DocumentRecordBase {   
    type: 'file' | 'sftp',
    sftp?: SftpData,
}

export interface DocumentRecordBase {
    receiverId: string,
    filePath: string,
}