import { ContextBridge, IpcRenderer } from 'electron';
import {EncryptedStoreApi} from './encryptedStore/encryptedStoreApi'
import {FileApi} from './file/fileApi'
import { SftpApi } from './sftp/sftpApi';
import { BrifleApi } from './brifle/brifleApi';

const encryptedStoreApi = new EncryptedStoreApi();
const fileApi = new FileApi();
const sftpApi = new SftpApi();
const brifleApi = new BrifleApi();


export function registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){
    
    encryptedStoreApi.registerApi(contextBridge, ipcRenderer)
    fileApi.registerApi(contextBridge, ipcRenderer)    
    sftpApi.registerApi(contextBridge, ipcRenderer)
    brifleApi.registerApi(contextBridge, ipcRenderer)
 
    
}