import { EncryptedStoreApiType } from "app/src-electron/apis/encryptedStore/encryptedStoreApi";

 
declare global {
    interface Window
    {
        encryptedStoreApi: EncryptedStoreApiType;
    }
    //...
}