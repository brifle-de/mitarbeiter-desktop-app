import { useEncryptedStore } from "src/stores/encrypted-store";

export default class UnsealGuard {
     

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async checkUnseal(to: any, from: any, next: any) {
        const encryptedStore = useEncryptedStore();
        const isUnsealed = encryptedStore.isLoaded;
        if (!isUnsealed) {
            return next({path: '/unseal'});
        } else {
            return next();
        }
    }
}