import { SftpData } from "app/src-electron/models/EncryptedStore";

export default interface DocumentRecord extends DocumentRecordBase {   
    type: 'file' | 'sftp',
    sftp?: SftpData | undefined,
}

export interface DocumentRecordBase {
    receiverId: string,
    filePath: string,
    docType: string | null
}