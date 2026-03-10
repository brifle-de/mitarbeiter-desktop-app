import { app } from "electron/main";
import { BulkSendTemplate, BulkSendTemplateMeta } from "./send_templates/templates/template";
import path from "path";
import { getAppDirectoryName } from "../const/AppConst";
import fs from "fs";

export default class BulkSendTemplateService {

    public readonly scriptsDirectoryName = "send_templates";


    /**
     * 
     * @returns returns the directory path
     */
    public getScriptsDirectoryPath(): string {
        const homeDir = app.getPath('home');
        const defaultScriptsDir = path.join(homeDir, getAppDirectoryName(), this.scriptsDirectoryName);
        return defaultScriptsDir;
    }

    /**
     * initializes the main templates directory
     */
    public initTemplatesDirectory() {
        const templatesDir = this.getScriptsDirectoryPath();
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }
    }

    /**
     * gets the list of available template ids
     * @returns 
     */
    async getTemplateIds(): Promise<string[]> {
        const templatesDir = this.getScriptsDirectoryPath();
        if (!fs.existsSync(templatesDir)) {
            return [];
        }
        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        return files.map(file => path.parse(file).name);
    }
    /**
     * gets the list of available templates with metadata
     * @returns 
     */
    async getTemplatesMetadata(): Promise<BulkSendTemplateMeta[]> {
        const templatesDir = this.getScriptsDirectoryPath();
        if (!fs.existsSync(templatesDir)) {
            return [];
        }
        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        return files.map(file => {
            const filePath = path.join(templatesDir, file);
            const stats = fs.statSync(filePath);            
            return {
                id: path.parse(file).name,
                fileName: file,
                createdAt: stats.birthtimeMs,
                size: stats.size,                 
            };
        });
    }

    /**
     * gets the list of available templates with metadata
     * @returns 
     */
    async getAllTemplates(): Promise<BulkSendTemplate[]> {
        const templatesDir = this.getScriptsDirectoryPath();
        if (!fs.existsSync(templatesDir)) {
            return [];
        }
        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        const templates: BulkSendTemplate[] = [];
        for (const file of files) {
            const filePath = path.join(templatesDir, file);
            const templateData = fs.readFileSync(filePath, 'utf-8');
            templates.push(JSON.parse(templateData) as BulkSendTemplate);
        }
        return templates;
    }

    /**
     * saves a template to the templates directory
     * @param template the template to save
     */
    async saveTemplate(template: BulkSendTemplate): Promise<void> {
        const templatesDir = this.getScriptsDirectoryPath();
        const templatePath = path.join(templatesDir, `${template.id}.json`);
        const isUpdating = fs.existsSync(templatePath);
        if (isUpdating) {
            template.updatedAt = new Date().toISOString();
        }
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    }

    /**
     * gets a template by its id
     * @param templateId the id of the template to get
     * @returns the template or null if not found
     */
    async getTemplate(templateId: string): Promise<BulkSendTemplate | null> {
        const templatesDir = this.getScriptsDirectoryPath();
        const templatePath = path.join(templatesDir, `${templateId}.json`);
        if (!fs.existsSync(templatePath)) {
            return null;
        }
        const templateData = fs.readFileSync(templatePath, 'utf-8');
        return JSON.parse(templateData) as BulkSendTemplate;
    }

    /**
     * deletes a template by its id
     * @param templateId the id of the template to delete
     */
    async deleteTemplate(templateId: string): Promise<void> {
        const templatesDir = this.getScriptsDirectoryPath();
        const templatePath = path.join(templatesDir, `${templateId}.json`);
        if (fs.existsSync(templatePath)) {
            fs.unlinkSync(templatePath);
        }
    }
}