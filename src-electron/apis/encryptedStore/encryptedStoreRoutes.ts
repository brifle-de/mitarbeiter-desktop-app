import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import type { AccountData } from '../../models/EncryptedStore'
import EncryptedStore from '../../service/EncryptedStore'

export default class EncryptedStoreRoutes{

    registerRoutes(){
        const encryptedStore = new EncryptedStore();        

        ipcMain.handle('encryptedStore:addAccount', async (event: IpcMainInvokeEvent, encryptionKey: string, account: AccountData) => {            
            return encryptedStore.addAccount(account,encryptionKey)
        })
        ipcMain.handle('encryptedStore:getAccount', async (event: IpcMainInvokeEvent, encryptionKey: string, accountId: string) => {
            return encryptedStore.getAccount(accountId,encryptionKey)
        })
        ipcMain.handle('encryptedStore:importAccount', async (event: IpcMainInvokeEvent, password: string, accountData: string) => {
            return encryptedStore.importAccount(accountData, password)
        })
        ipcMain.handle('encryptedStore:exportAccount', async (event: IpcMainInvokeEvent, password: string, accountId: AccountData) => {
            return encryptedStore.exportAccount(accountId, password)
        })
        ipcMain.handle('encryptedStore:deleteAccount', async (event: IpcMainInvokeEvent, encryptionKey: string, accountId: string) => {
            return encryptedStore.deleteAccount(accountId, encryptionKey)
        })
        ipcMain.handle('encryptedStore:updateAccount',async (event: IpcMainInvokeEvent, encryptionKey: string, account :AccountData) => {
            return encryptedStore.storeAccount(account, encryptionKey)
        })
        ipcMain.handle('encryptedStore:isInitialized', async () => {
            return encryptedStore.isInitialized()
        });
        ipcMain.handle('encryptedStore:getKey', async (event: IpcMainInvokeEvent, password: string, salt: string) => {
            return encryptedStore.getKey(password, salt)
        });
        ipcMain.handle('encryptedStore:loadMetadata', async (event: IpcMainInvokeEvent, password: string) => {
            return encryptedStore.loadMetadata(password)
        })
        ipcMain.handle('encryptedStore:initStore', async (event: IpcMainInvokeEvent, password: string) => {
            return encryptedStore.initStore(password)
        }) 

    }

   

}

