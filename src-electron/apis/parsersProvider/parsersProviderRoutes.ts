
import ParsersService from 'app/src-electron/service/ParsersService'
import {  ipcMain } from 'electron'

export default class ParsersProviderRoutes{

    private readonly parsersService = new ParsersService();
 

    registerRoutes(){          
        ipcMain.handle('parsersProvider:fetchAllParsers', async () => {
            return this.parsersService.fetchAllParsersContent();
        })      
        ipcMain.handle('parsersProvider:fetchParsersByType', async (event, type: 'receivers' | 'directories') => {
            return this.parsersService.fetchParsersByType(type);
        })
    }


}