import { ContextBridge, IpcRenderer } from "electron";


export class ParsersProviderApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('parsersProvider', {
            fetchAllParsers: () => ipcRenderer.invoke('parsersProvider:fetchAllParsers'),
            fetchParsersByType: (type: 'receivers' | 'directories') => ipcRenderer.invoke('parsersProvider:fetchParsersByType', type),
            
        }) 
    }

 }
 export interface ParsersProviderApiType {
    
    /**
     * 
     * @param endpoint - The endpoint to call the brifle API
     * @returns the api id
     */
    fetchAllParsers: () => Promise<ParsersInfos>;    

    /**
     * gets all the available endpoints from the brifle API for the content
     * @returns the api id
     */
    fetchParsersByType: (type: 'receivers' | 'directories') => Promise<Record<string, string>>;
   

 }
    

export interface ParsersInfos{
    // key => json file content
    receivers: Record<string, string>;
    // key => json file content
    directories: Record<string, string>;
}
