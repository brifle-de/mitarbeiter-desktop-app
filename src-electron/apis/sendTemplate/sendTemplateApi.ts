import { BulkSendTemplate, BulkSendTemplateMeta } from "app/src-electron/service/send_templates/templates/template";
import { ContextBridge, IpcRenderer } from "electron";

export class SendTemplateApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('sendTemplateApi', {
            getTemplatesMeta: () => ipcRenderer.invoke('sendTemplate:getTemplatesMeta'),
            getTemplateContent: (id: string) => ipcRenderer.invoke('sendTemplate:getTemplateContent', id),
            saveTemplate: (content: BulkSendTemplate) => ipcRenderer.invoke('sendTemplate:saveTemplate', content),
            deleteTemplate: (id: string) => ipcRenderer.invoke('sendTemplate:deleteTemplate', id),
            getTemplateIds: () => ipcRenderer.invoke('sendTemplate:getTemplateIds'),
            getAllTemplates: () => ipcRenderer.invoke('sendTemplate:getAllTemplates')
        }) 
    }
 }
 export interface SendTemplateApiType {
    getTemplatesMeta: () => Promise<BulkSendTemplateMeta[]>;
    getTemplateContent: (id: string) => Promise<BulkSendTemplate>;
    saveTemplate: (content: BulkSendTemplate) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    getTemplateIds: () => Promise<string[]>;
    getAllTemplates: () => Promise<BulkSendTemplate[]>;
    
}