
import EncryptedStoreRoutes from './encryptedStore/encryptedStoreRoutes'
import FileRoutes from './file/fileRoutes';
import SftpRoutes from './sftp/sftpRoutes';

const encryptedStoreRoutes = new EncryptedStoreRoutes();
const fileRoutes = new FileRoutes();
const sftpRoutes = new SftpRoutes();

export function registerRoutes(){
    encryptedStoreRoutes.registerRoutes()
    fileRoutes.registerRoutes()
    sftpRoutes.registerRoutes()
}

