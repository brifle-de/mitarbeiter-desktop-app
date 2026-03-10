import { useEncryptedStore } from "src/stores/encrypted-store";
import { useSessionStore } from "src/stores/session-store";
import { useBrifleStore } from "src/stores/brifle-store";
import { ApiEndpoints } from "app/src-electron/models/EncryptedStore";
import Brifle from "src/services/node/Brifle";

import pRetry from 'p-retry';

export default class UnsealGuard {
     
    /*
    Handles the authentication with the brifle API so that an authentication is not required on every request.
    */
    private static async checkAuthApi(){
        const sessionStore = useSessionStore();
        const currentAccountId = sessionStore.selectedAccountId;
        if (!currentAccountId) {
            return;
        }
        const brifleStore = useBrifleStore();
        const encryptedStore = useEncryptedStore();
        const currentAccount = encryptedStore.getAccount(currentAccountId)
        const apiKey = currentAccount?.apiKey;
        const apiSecret = currentAccount?.apiSecret;
        if (!apiKey || !apiSecret) {
            return;
        }        
        const endpoint = ApiEndpoints.getEndpoint(currentAccount.apiEnv)
        const api = await brifleStore.getApi(apiKey, endpoint);
        if (!api) {
            return;
        }
        const hasAuthenticated = await brifleStore.hasApiAuthenticated(apiKey, endpoint);
        if (!hasAuthenticated) {
            const run = async () => Brifle.authentication().authLogin(api,{
                key: apiKey,
                secret: apiSecret,
            });
            const authResponse = await pRetry(run,{
                retries: 50,
                minTimeout: 3500,
                maxTimeout: 10000,
                onFailedAttempt: (error) => {
                    console.warn(`Authentication attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
                }
            });
            if (authResponse.error) {
                console.error('Authentication failed:', authResponse.error);
                return;
            }
            void brifleStore.authenticate(apiKey, endpoint);
        }

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async checkUnseal(to: any, from: any, next: any) {
        const encryptedStore = useEncryptedStore();
       
        const isUnsealed = encryptedStore.isLoaded;
        if (!isUnsealed) {
            return next({path: '/unseal'});
        } else {        
            void await this.checkAuthApi();
            return next();
        }
    }
}