import { BrifleApiType } from "app/src-electron/apis/brifle/brifleApi";
import { EncryptedStoreApiType } from "app/src-electron/apis/encryptedStore/encryptedStoreApi";
import { FileApiType } from "app/src-electron/apis/file/fileApi";
import { SftpApiType } from "app/src-electron/apis/sftp/sftpApi";

 
declare global {
    interface Window
    {
        encryptedStoreApi: EncryptedStoreApiType;
        fileApi: FileApiType;
        sftpApi: SftpApiType; 
        brifleApi: BrifleApiType;
    }   
}