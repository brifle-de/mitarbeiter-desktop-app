
import BrifleRoutes from './brifle/brifleRoutes';
import ElectronRoutes from './electron/electronRoutes';
import EncryptedStoreRoutes from './encryptedStore/encryptedStoreRoutes'
import FileRoutes from './file/fileRoutes';
import LogRoutes from './logger/logRoutes';
import ParsersProviderRoutes from './parsersProvider/parsersProviderRoutes';
import SftpRoutes from './sftp/sftpRoutes';

const encryptedStoreRoutes = new EncryptedStoreRoutes();
const fileRoutes = new FileRoutes();
const sftpRoutes = new SftpRoutes();
const brifleRoutes = new BrifleRoutes(); // Assuming you have a BrifleRoutes class
const electronRoutes = new ElectronRoutes(); // Assuming you have a ElectronRoutes class
const logRoutes = new LogRoutes(); // Assuming you have a LogRoutes class
const parsersProviderRoutes = new ParsersProviderRoutes()

export function registerRoutes(){
    encryptedStoreRoutes.registerRoutes()
    fileRoutes.registerRoutes()
    sftpRoutes.registerRoutes()
    // Registering Brifle routes
    brifleRoutes.registerRoutes()  
    electronRoutes.registerRoutes() // Assuming you have a function to register Electron routes
    // Registering Log routes
    logRoutes.registerRoutes()
    parsersProviderRoutes.registerRoutes()
    
}

