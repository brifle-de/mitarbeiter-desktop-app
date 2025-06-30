import { ApiEndpoints } from "app/src-electron/models/EncryptedStore";
import { useBrifleStore } from "src/stores/brifle-store";
import { useEncryptedStore } from "src/stores/encrypted-store";
import { useSessionStore } from "src/stores/session-store";

export default class SessionContext {

    private readonly sessionStore = useSessionStore();
    private readonly brifleStore = useBrifleStore();
    private readonly encryptedStore = useEncryptedStore();

    constructor() {

    }

    /**
     * Get the current API ID based on the selected account in the session store.
     * If no account is selected or the account does not exist, it returns undefined.
     * 
     * @returns {Promise<string>} The API ID or an empty string if no account is selected or the account does not exist.
     */
    public async getCurrentApiId(): Promise<string> {
        const aId = this.sessionStore.selectedAccountId
        if (!aId) {
            return '';
        }
        const acc = this.encryptedStore.getAccount(aId);
        if (!acc) {
            return '';
        }
        const env = ApiEndpoints.getEndpoint(acc.apiEnv);
        const apiKey = acc.apiKey ?? '';
        if (!env) {
            return '';
        }
        const apiId = this.brifleStore.getApi(apiKey, env);
        return apiId;
    }




}