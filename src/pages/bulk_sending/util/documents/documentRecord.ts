import { SftpData } from "app/src-electron/models/EncryptedStore";

export default interface DocumentRecord {
    receiverId: string,
    filePath: string,
    type: 'file' | 'sftp',
    sftp?: SftpData,
}