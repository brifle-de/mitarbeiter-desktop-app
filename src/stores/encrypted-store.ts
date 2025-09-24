import { AccountData, EncryptedStoreType } from 'app/src-electron/models/EncryptedStore';
import EncryptedStoreService from 'app/src/services/node/EncryptedStoreService';

import { defineStore, acceptHMRUpdate } from 'pinia';

const encryptedStoreService = new EncryptedStoreService();

export const useEncryptedStore = defineStore('encrypted-store', {
  state: () => ({
    meta: null as EncryptedStoreType | null,
    _accounts: [] as AccountData[],
    key: null as string | null,
  }),

  getters: {
    metaData: (state) => {
      return state.meta;
    },
    accounts: (state) => {
      return state._accounts;
    },
    isLoaded: (state) => {  
      return state.meta !== null;
    }
  },

  actions: {
    exportAccount(password: string, accountData: AccountData) {      
      return encryptedStoreService.exportAccount(password, accountData);
    },
    importAccount(password: string, accountData: string) {
      return encryptedStoreService.importAccount(password, accountData).then((account: AccountData | null) => {
        if (account) {
          this._accounts.push(account);
        }
        return account;
      });
    },
    loadData(password: string) {      
      return encryptedStoreService.loadMetadata(password).then(async (data: EncryptedStoreType) => {       
        this.meta = data;
        this._accounts = [];
        this.key = await encryptedStoreService.getKey(password, data.salt);
        this.meta.accountIds.forEach((accountId) => {
          void encryptedStoreService.getAccount(this.key!, accountId)
          .then((account: AccountData | null) => {
            if (account) {
              this._accounts.push(account);
            }
          });
        }
        );
      });
    },
    getAccount(accountId: string) {
      return this._accounts.find((account) => account.id === accountId);
    }, 
    checkIfInitialized() {
      return encryptedStoreService.isInitialized();
    },
    init(password: string) {
      return encryptedStoreService.initStore(password).then((meta: EncryptedStoreType) => {
        this.meta = meta;
        this._accounts = [];
        // load init key data
        void this.loadData(password);
      });
    },
    /**
     * generates an id for the account and adds it to the store
     * @param account the account to add
     * @returns 
     */
    createAccount(account: AccountData){
      if (!this.key) {
        throw new Error('Key is not initialized');
      }
      account.id = crypto.randomUUID();
      return encryptedStoreService.addAccount(this.key, account).then(() => {
        this._accounts.push(account);
      });
    },
    /**
     * removes the account from the store and from the file system
     * @param accountId the id of the account to get
     * @returns 
     */
    deleteAccount(accountId: string) {
      if (!this.key) {
        throw new Error('Key is not initialized');
      }
      return encryptedStoreService.deleteAccount(this.key, accountId).then(() => {
        const index = this._accounts.findIndex((a) => a.id === accountId);
        if (index !== -1) {
          this._accounts.splice(index, 1);
        }
      });
    },
    /**
     * 
     * @param account the account to delete
     * @returns 
     */
    updateAccount(account: AccountData) {
      if (!this.key) {
        throw new Error('Key is not initialized');
      }
      return encryptedStoreService.updateAccount(this.key, account).then(() => {
        const index = this._accounts.findIndex((a) => a.id === account.id);
        if (index !== -1) {
          this._accounts[index] = account;
        }
      });
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEncryptedStore, import.meta.hot));
}
