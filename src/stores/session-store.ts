
import { defineStore, acceptHMRUpdate } from 'pinia';


export const useSessionStore = defineStore('session-store', {
  state: () => ({
    selectedAccountId: null as string | null,
  }),
  getters: {
    /**
     * get the selected account id
     * @returns {string | null} the selected account id or null if no account is selected
     */
    getSelectedAccountId: (state) => {
      return state.selectedAccountId;
    },
    /**
     * check if an account is selected
     * @returns {boolean} true if an account is selected, false otherwise
     */
    isAccountSelected: (state) => {
      return state.selectedAccountId !== null;
    },
  },
    actions: {
        /**
         * set the selected account id
         * @param accountId the account id to set
         */
        setSelectedAccountId(accountId: string) {
            this.selectedAccountId = accountId;
        }
    },
}); 

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot));
}