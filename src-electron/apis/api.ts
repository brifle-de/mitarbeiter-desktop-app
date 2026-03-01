import { ContextBridge, IpcRenderer } from 'electron';
import {EncryptedStoreApi} from './encryptedStore/encryptedStoreApi'
import {FileApi} from './file/fileApi'
import { SftpApi } from './sftp/sftpApi';
import { BrifleApi } from './brifle/brifleApi';
import { ElectronApi } from './electron/electronApi';
import { LogApi } from './logger/logApi';
import { ParsersProviderApi } from './parsersProvider/parsersProviderApi';
import { OcrApi } from './ocr/ocrApi';
import { ScriptsApi } from './scripts/scriptsApi';
import { SendTemplateApi } from './sendTemplate/sendTemplateApi';

const encryptedStoreApi = new EncryptedStoreApi();
const fileApi = new FileApi();
const sftpApi = new SftpApi();
const brifleApi = new BrifleApi();
const electronApi = new ElectronApi();
const logApi = new LogApi();
const parsersProvidersApi = new ParsersProviderApi();
const ocrApi = new OcrApi();
const scriptsApi = new ScriptsApi();
const sendTemplateApi = new SendTemplateApi();


export function registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){
    
    encryptedStoreApi.registerApi(contextBridge, ipcRenderer)
    fileApi.registerApi(contextBridge, ipcRenderer)    
    sftpApi.registerApi(contextBridge, ipcRenderer)
    brifleApi.registerApi(contextBridge, ipcRenderer)
    electronApi.registerApi(contextBridge, ipcRenderer)
    logApi.registerApi(contextBridge, ipcRenderer)
    parsersProvidersApi.registerApi(contextBridge, ipcRenderer)
    ocrApi.registerApi(contextBridge, ipcRenderer)
    scriptsApi.registerApi(contextBridge, ipcRenderer)
    sendTemplateApi.registerApi(contextBridge, ipcRenderer)
 
    
}