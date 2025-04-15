import { SftpData } from "app/src-electron/models/EncryptedStore";
import { DocumentSourceDirParserRules } from "./documents/parsers";

export interface ReceiverSource {
    type: 'file' | 'sftp',
    file?: string,
    sftp?: SftpReceiverSource
}

export interface SftpReceiverSource {
    connection?: SftpData | null,
    filePath: string,
}

export interface SftpDocumentSource {
    connection?: SftpData | null,
    filePath: string,
}



export interface DocumentSource {
    type: 'file' | 'sftp',
    file?: string,
    sftp?: SftpDocumentSource
    destType: 'directory' | 'file',
    dirParser? : DocumentSourceDirParserRules,
}