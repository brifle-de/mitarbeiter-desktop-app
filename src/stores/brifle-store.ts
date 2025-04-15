
import { defineStore, acceptHMRUpdate } from 'pinia';




/**
 * used to store session session data
 */
export const useBrifleStore = defineStore('brifle-store', {
    state: () => ({
        // hash(apiKey + endpoint) => apiId
        apiIds: new Map<string, string>(),
    }),
    actions: {
        async getApi(apiKey: string, endpoint: string) : Promise<string> {
            // compute hash over apiKey and endpoint
            const sourceBytes = new TextEncoder().encode(apiKey + endpoint);
            const hash = await window.crypto.subtle.digest("SHA-256", sourceBytes);
            const hashArray = Array.from(new Uint8Array(hash));
            const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
            if (this.apiIds.has(hashHex)) {
                return Promise.resolve(this.apiIds.get(hashHex)!);
            }
            return window.brifleApi.newApi(endpoint).then((apiId: string) => {
                this.apiIds.set(hashHex, apiId);
                return apiId;
            });
        }
    }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBrifleStore, import.meta.hot));
}
