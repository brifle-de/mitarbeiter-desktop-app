import BulkSendTemplateService from 'app/src-electron/service/BulkSendTemplateService';
import { BulkSendTemplate } from 'app/src-electron/service/send_templates/templates/template';
import {  ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export default class SendTemplateRoutes{

    private readonly sendTemplateService = new BulkSendTemplateService();

    registerRoutes(){
        ipcMain.handle('sendTemplate:getTemplatesMeta', async () => {            
            return this.sendTemplateService.getTemplatesMetadata(); 
        }) 
        ipcMain.handle('sendTemplate:getTemplateContent', async (event: IpcMainInvokeEvent, id: string) => {            
            return this.sendTemplateService.getTemplate(id); 
        })
        ipcMain.handle('sendTemplate:saveTemplate', async (event: IpcMainInvokeEvent, content: BulkSendTemplate) => {            
            return this.sendTemplateService.saveTemplate(content); 
        })
        ipcMain.handle('sendTemplate:deleteTemplate', async (event: IpcMainInvokeEvent, id: string) => {            
            return this.sendTemplateService.deleteTemplate(id); 
        })
        ipcMain.handle('sendTemplate:getTemplateIds', async () => {            
            return this.sendTemplateService.getTemplateIds(); 
        })
        ipcMain.handle('sendTemplate:getAllTemplates', async () => {            
            return this.sendTemplateService.getAllTemplates();
        })
    }
}