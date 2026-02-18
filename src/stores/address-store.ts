
import { ParsedAddressResponse } from '@brifle/brifle-sdk';
import { defineStore, acceptHMRUpdate } from 'pinia';


export const useAddressStore = defineStore('address-store', {
  state: () => ({
    addressMap: new Map<string, ParsedAddressResponse>(),
  }),
  getters: {
    /**
     * get the selected account id
     * @returns {string | null} the selected account id or null if no account is selected
     */
    getPostalAddresses: (state) => {
      return state.addressMap;
    },
    /**
     * check if an account is selected
     * @returns {boolean} true if an account is selected, false otherwise
     */
    hasAddresses: (state) => {
      return state.addressMap.size > 0;
    },
  },
    actions: {
        /**
         * set the selected account id
         * @param accountId the account id to set
         */
        storeAddress(key: string, address: ParsedAddressResponse) {
            this.addressMap.set(key, address);
        },
        /**
         * find an address by key
         * @param key the key to find the address for
         * @returns the postal address or undefined if not found
         */
        findAddress(key: string): ParsedAddressResponse | undefined {
            return this.addressMap.get(key);
        },
        /**
         * check if an address exists for the given key
         * @param key the key to check for
         * @returns true if an address exists for the key, false otherwise
         */
        hasAddress(key: string): boolean {
            return this.addressMap.has(key);
        }

    },
}); 

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAddressStore, import.meta.hot));
}