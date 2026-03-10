
import AppUpdateService from '../service/AppUpdateService';
import BrifleRoutes from './brifle/brifleRoutes';
import ElectronRoutes from './electron/electronRoutes';
import EncryptedStoreRoutes from './encryptedStore/encryptedStoreRoutes'
import FileRoutes from './file/fileRoutes';
import LogRoutes from './logger/logRoutes';
import OcrRoutes from './ocr/ocrRoutes';
import ParsersProviderRoutes from './parsersProvider/parsersProviderRoutes';
import ScriptsRoutes from './scripts/scriptsRoutes';
import SendTemplateRoutes from './sendTemplate/sendTemplateRoutes';
import SftpRoutes from './sftp/sftpRoutes';

const encryptedStoreRoutes = new EncryptedStoreRoutes();
const fileRoutes = new FileRoutes();
const sftpRoutes = new SftpRoutes();
const brifleRoutes = new BrifleRoutes(); 

const logRoutes = new LogRoutes();
const parsersProviderRoutes = new ParsersProviderRoutes()
const ocrRoutes = new OcrRoutes();
const scriptsRoutes = new ScriptsRoutes(); 
const sendTemplateRoutes = new SendTemplateRoutes(); 

export function registerRoutes(appUpdateService: AppUpdateService){

    const electronRoutes = new ElectronRoutes(appUpdateService);  

    encryptedStoreRoutes.registerRoutes()
    fileRoutes.registerRoutes()
    sftpRoutes.registerRoutes()
    // Registering Brifle routes
    brifleRoutes.registerRoutes()  
    electronRoutes.registerRoutes() 
    // Registering Log routes
    logRoutes.registerRoutes()
    parsersProviderRoutes.registerRoutes()
    ocrRoutes.registerRoutes() 
    scriptsRoutes.registerRoutes() 
    sendTemplateRoutes.registerRoutes() 

    
}

