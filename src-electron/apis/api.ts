import {EncryptedStoreApi} from './encryptedStore/encryptedStoreApi'

const encryptedStoreApi = new EncryptedStoreApi();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerApi(contextBridge: any, ipcRenderer: any){
     
    encryptedStoreApi.registerApi(contextBridge, ipcRenderer)
    
}