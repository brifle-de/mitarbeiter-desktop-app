 
import { ContextBridge, IpcRenderer } from "electron";
import { AccountData, EncryptedStoreType } from "../../models/EncryptedStore"

 export class EncryptedStoreApi{
    
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('encryptedStoreApi', {
            addAccount: (encryptionKey: string, accountData: AccountData) => ipcRenderer.invoke('encryptedStore:addAccount', encryptionKey, accountData),
            getAccount: (encryptionKey: string, accountId: string) => ipcRenderer.invoke('encryptedStore:getAccount', encryptionKey, accountId),
            importAccount: (password: string, accountData: string) => ipcRenderer.invoke('encryptedStore:importAccount', password, accountData),
            exportAccount: (password: string, accountId: AccountData) => ipcRenderer.invoke('encryptedStore:exportAccount', password, accountId),
            deleteAccount: (encryptionKey: string, accountId: string) => ipcRenderer.invoke('encryptedStore:deleteAccount', encryptionKey, accountId),
            updateAccount: (encryptionKey: string, accountData: AccountData) => ipcRenderer.invoke('encryptedStore:updateAccount', encryptionKey, accountData),
            isInitialized: () => ipcRenderer.invoke('encryptedStore:isInitialized'),
            getKey: (password: string, salt: string) => ipcRenderer.invoke('encryptedStore:getKey', password, salt),
            loadMetadata: (password: string) => ipcRenderer.invoke('encryptedStore:loadMetadata', password),
            initStore: (password: string) => ipcRenderer.invoke('encryptedStore:initStore', password) 
        })
    }

 }
 export interface EncryptedStoreApiType {
    addAccount: (encryptionKey: string, accountData: AccountData) => Promise<boolean>;
    getAccount: (encryptionKey: string, accountId: string) => Promise<AccountData | null>;
    importAccount: (password: string, accountData: string) => Promise<AccountData | null>;
    exportAccount: (password: string, accountId: AccountData) => Promise<string | null>;
    deleteAccount: (encryptionKey: string, accountId: string) => Promise<boolean>;
    updateAccount: (encryptionKey: string, accountData: AccountData) => Promise<AccountData | null>;
    isInitialized: () => Promise<boolean>;
    loadMetadata: (password: string) => Promise<EncryptedStoreType>;
    initStore: (password: string) => Promise<EncryptedStoreType>;
    getKey: (password: string, salt: string) => Promise<string>;
}