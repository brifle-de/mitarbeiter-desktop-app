
import EncryptedStoreRoutes from './encryptedStore/encryptedStoreRoutes'

const encryptedStoreRoutes = new EncryptedStoreRoutes();

export function registerRoutes(){
    encryptedStoreRoutes.registerRoutes()
}

