import { BulkSendTemplate, BulkSendTemplateMeta } from "app/src-electron/service/send_templates/templates/template";

export default class SendTemplate {

    /**
     * Fetches metadata for all available send templates.
     * @returns 
     */
    getTemplatesMetadata(): Promise<BulkSendTemplateMeta[]> {
        return window.sendTemplateApi.getTemplatesMeta();
    }
    /**
     * Fetches the content of a specific send template by its ID.
     * @param id - The ID of the template to fetch.
     * @returns 
     */
    getTemplate(id: string): Promise<BulkSendTemplate> {
        return window.sendTemplateApi.getTemplateContent(id);
    }
    /**
     * Saves a send template. If a template with the same ID already exists, it will be overwritten.
     * @param content - The content of the template to save, including its metadata and actual content.
     */
    saveTemplate(content: BulkSendTemplate): Promise<void> {
        return window.sendTemplateApi.saveTemplate(JSON.parse(JSON.stringify(content)));
    }
    /**
     * Deletes a send template by its ID.
     * @param id - The ID of the template to delete.
     */
    deleteTemplate(id: string): Promise<void> {
        return window.sendTemplateApi.deleteTemplate(id);
    }
    /**
     * Fetches a list of all available send template IDs.
     * @returns 
     */
    getTemplateIds(): Promise<string[]> {
        return window.sendTemplateApi.getTemplateIds();
    }

    /**
     * Fetches all send templates with their full content.
     * @returns 
     */
    getAllTemplates(): Promise<BulkSendTemplate[]> {
        return window.sendTemplateApi.getAllTemplates();
    }
}