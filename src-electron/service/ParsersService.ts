import { AppDirectoryName } from "../const/AppConst";
import path from "node:path";
import { app } from "electron";
import fs from "fs";

export default class ParsersService {


    public static readonly DIRECTORY_NAME = "parsers";
    public static readonly RECEIVERS_FILE_PARSER_DIR = "receivers";
    public static readonly DIRECTORY_PARSER_DIR = "directories";


    private getBaseDirectoryPath(): string {
        const homeDir = app.getPath('home');
        const defaultLogDir = path.join(homeDir, AppDirectoryName, ParsersService.DIRECTORY_NAME)
        return defaultLogDir;
    }

    private getParserFiles(subDir: string): string[] {
        const baseDir = this.getBaseDirectoryPath();
        const targetDir = path.join(baseDir, subDir);
        if (!fs.existsSync(targetDir)) {
            return [];
        }
        return fs.readdirSync(targetDir).filter(file => file.endsWith('.json'));
    }

    /**
     * initializes the required directories for parsers
     */
    public initDirectory(){
        const baseDir = this.getBaseDirectoryPath();
        const receiversDir = path.join(baseDir, ParsersService.RECEIVERS_FILE_PARSER_DIR);
        const directoriesDir = path.join(baseDir, ParsersService.DIRECTORY_PARSER_DIR);
        const requiredDirs = [baseDir, receiversDir, directoriesDir];
        this.createDirectoriesIfNotExist(requiredDirs);
    }

    private createDirectoriesIfNotExist(dirPaths: string[]) {
        dirPaths.forEach(dirPath => {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }

    /**
     * gets the list of available receivers file parser files
     * @returns 
     */
    public getReceiversParserFiles(): string[] {
        return this.getParserFiles(ParsersService.RECEIVERS_FILE_PARSER_DIR);
    }

    /**
     * gets the list of available directory parser files
     * @returns 
     */
    public getDirectoryParserFiles(): string[] {
        return this.getParserFiles(ParsersService.DIRECTORY_PARSER_DIR);
    }

    /**
     * fetches all available parser files
     * @returns 
     */
    public fetchAllParserFiles(): { receivers: string[], directories: string[] } {
        return {
            receivers: this.getReceiversParserFiles(),
            directories: this.getDirectoryParserFiles()
        }
    }

    /**
     * fetches the content of a parser file
     * @param subDir 
     * @param fileName 
     * @returns 
     */
    public fetchParserFileContent(subDir: string, fileName: string): string | null {
        const baseDir = this.getBaseDirectoryPath();
        const targetDir = path.join(baseDir, subDir);
        const filePath = path.join(targetDir, fileName);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, 'utf-8');
    }

    /**
     * fetches the content of parser files by type
     * @param type 
     * @returns 
     */
    public fetchParsersByType(type: 'receivers' | 'directories'): Record<string, string> {
        const result: Record<string, string> = {};
        let files: string[] = [];
        if (type === 'receivers') {
            files = this.getReceiversParserFiles();
        } else if (type === 'directories') {
            files = this.getDirectoryParserFiles();
        }
        files.forEach(file => {
            const content = this.fetchParserFileContent(type === 'receivers' ? ParsersService.RECEIVERS_FILE_PARSER_DIR : ParsersService.DIRECTORY_PARSER_DIR, file);
            if (content) {
                result[file] = content;
            }
        });
        return result;
    }

    /**
     * fetches the content of all parser files
     * @returns 
     */
    public fetchAllParsersContent(): { receivers: Record<string, string>, directories: Record<string, string> } {
        const receiversFiles = this.getReceiversParserFiles();
        const directoriesFiles = this.getDirectoryParserFiles();
        const receiversContent: Record<string, string> = {};
        const directoriesContent: Record<string, string> = {};
        receiversFiles.forEach(file => {
            const content = this.fetchParserFileContent(ParsersService.RECEIVERS_FILE_PARSER_DIR, file);
            if (content) {
                receiversContent[file] = content;
            }
        });
        directoriesFiles.forEach(file => {
            const content = this.fetchParserFileContent(ParsersService.DIRECTORY_PARSER_DIR, file);
            if (content) {
                directoriesContent[file] = content;
            }
        });
        return {
            receivers: receiversContent,
            directories: directoriesContent
        }
    }   
}