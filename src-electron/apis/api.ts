import { ContextBridge, IpcRenderer } from 'electron';
import {EncryptedStoreApi} from './encryptedStore/encryptedStoreApi'
import {FileApi} from './file/fileApi'
import { SftpApi } from './sftp/sftpApi';
import { BrifleApi } from './brifle/brifleApi';
import { ElectronApi } from './electron/electronApi';
import { LogApi } from './logger/logApi';

const encryptedStoreApi = new EncryptedStoreApi();
const fileApi = new FileApi();
const sftpApi = new SftpApi();
const brifleApi = new BrifleApi();
const electronApi = new ElectronApi();
const logApi = new LogApi();


export function registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){
    
    encryptedStoreApi.registerApi(contextBridge, ipcRenderer)
    fileApi.registerApi(contextBridge, ipcRenderer)    
    sftpApi.registerApi(contextBridge, ipcRenderer)
    brifleApi.registerApi(contextBridge, ipcRenderer)
    electronApi.registerApi(contextBridge, ipcRenderer)
    logApi.registerApi(contextBridge, ipcRenderer)
 
    
}