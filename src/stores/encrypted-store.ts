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
      console.log('isLoaded', state.meta);
      return state.meta !== null;
    }
  },

  actions: {
    loadData(password: string) {      
      return encryptedStoreService.loadMetadata(password).then(async (data: EncryptedStoreType) => {       
        this.meta = data;
        this._accounts = [];
        this.key = await encryptedStoreService.getKey(password, data.salt);
        console.log('key', this.key);
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
    checkIfInitialized() {
      return encryptedStoreService.isInitialized();
    },
    init(password: string) {
      return encryptedStoreService.initStore(password).then((meta: EncryptedStoreType) => {
        this.meta = meta;
        this._accounts = [];
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
