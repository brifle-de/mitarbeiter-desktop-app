import { AccountData, EncryptedStoreType } from "app/src-electron/models/EncryptedStore";

export default class EncryptedStoreService {

    /**
     * add an account to the store
     * @param encryptionKey the encryption key to use
     * @param account the account to add
     * @returns {Promise<boolean>} true if the account was added, false otherwise
     */
    async addAccount(encryptionKey: string, account: AccountData): Promise<boolean> {
        account = JSON.parse(JSON.stringify(account)); // remove unallowed properties
        return window.encryptedStoreApi.addAccount(encryptionKey,account);
    }

    /**
     * get an account from the store
     * @param encryptionKey the encryption key to use
     * @param accountId the id of the account to get
     * @returns {Promise<AccountData | null>} the account or null if not found
     */
    async getAccount(encryptionKey: string, accountId: string): Promise<AccountData | null> {
        return window.encryptedStoreApi.getAccount(encryptionKey,accountId);
    }

    /**
     * import an account from a string
     * @param password the password to use
     * @param accountData the account data as string
     * @returns {Promise<AccountData | null>} the imported account or null if not found
     */
    async importAccount(password: string, accountData: string): Promise<AccountData | null> {
        return window.encryptedStoreApi.importAccount(password,accountData);
    }

    /**
     * export an account to a string
     * @param password the password to use
     * @param accountId the id of the account to export
     * @returns {Promise<string | null>} the exported account data as string or null if not found
     */
    async exportAccount(password: string, accountId: AccountData): Promise<string | null> {
        return window.encryptedStoreApi.exportAccount(password,accountId);
    }

    /**
     * delete an account from the store
     * @param encryptionKey the encryption key to use
     * @param accountId the id of the account to delete
     * @returns {Promise<boolean>} true if the account was deleted, false otherwise
     */
    async deleteAccount(encryptionKey: string, accountId: string): Promise<boolean> {
        return window.encryptedStoreApi.deleteAccount(encryptionKey,accountId);
    }

    /**
     * update an account in the store
     * @param encryptionKey the encryption key to use
     * @param account the account to update
     * @returns {Promise<AccountData | null>} the updated account or null if not found
     */
    async updateAccount(encryptionKey: string, account: AccountData): Promise<AccountData | null> {
        account = JSON.parse(JSON.stringify(account)); // remove unallowed properties
        return window.encryptedStoreApi.updateAccount(encryptionKey,account);
    }

    /**
     * check if the store is initialized
     * @returns {Promise<boolean>} true if the store is initialized, false otherwise
     */
    async isInitialized(): Promise<boolean> {     
        return window.encryptedStoreApi.isInitialized();
    }

    /**
     * load the metadata of the store
     * @param password the password to use
     * @returns {Promise<EncryptedStoreType>} the metadata of the store
     */
    async loadMetadata(password: string): Promise<EncryptedStoreType> {
        return window.encryptedStoreApi.loadMetadata(password);
    }

    /**
     * initialize the store
     * @param password the password to use
     * @returns {Promise<EncryptedStoreType>} the metadata of the store
     */
    async initStore(password: string): Promise<EncryptedStoreType> {
        return window.encryptedStoreApi.initStore(password);
    }

    /**
     * generate a key from the password
     * @param password the password to use
     * @param salt the salt to use
     * @returns {Buffer} the key as a buffer
     */
    async getKey(password: string, salt: string): Promise<string> {
        return window.encryptedStoreApi.getKey(password,salt);
    }



}