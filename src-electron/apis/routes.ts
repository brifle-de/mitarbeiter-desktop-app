
import BrifleRoutes from './brifle/brifleRoutes';
import EncryptedStoreRoutes from './encryptedStore/encryptedStoreRoutes'
import FileRoutes from './file/fileRoutes';
import SftpRoutes from './sftp/sftpRoutes';

const encryptedStoreRoutes = new EncryptedStoreRoutes();
const fileRoutes = new FileRoutes();
const sftpRoutes = new SftpRoutes();
const brifleRoutes = new BrifleRoutes(); // Assuming you have a BrifleRoutes class

export function registerRoutes(){
    encryptedStoreRoutes.registerRoutes()
    fileRoutes.registerRoutes()
    sftpRoutes.registerRoutes()
    // Registering Brifle routes
    brifleRoutes.registerRoutes()  
}

