import { spawn } from "child_process";
import { getAppDirectoryName } from "../const/AppConst";
import path from "path";
import { app } from "electron";

import fs from "fs";

export default class ScriptsService {

    public readonly supportedScriptExtensions = ['.js', '.py'];
    public readonly checkForSupportedEnvs = ['node', 'python'];
    public readonly scriptsDirectoryName = "scripts";


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
     * initializes the main scripts directory
     */
    public initScriptsDirectory() {
        const scriptsDir = this.getScriptsDirectoryPath();
        this.createDirectoriesIfNotExist([scriptsDir]);
        this.initLanguageSpecificSubdirectories();
    }
 

    /**    
     * initializes the language specific subdirectories for scripts
     */
    public initLanguageSpecificSubdirectories() {
        const scriptsDir = this.getScriptsDirectoryPath();
        const dirPaths = this.checkForSupportedEnvs.map(env => path.join(scriptsDir, env));
        this.createDirectoriesIfNotExist(dirPaths);
    }
   
    private createDirectoriesIfNotExist(dirPaths: string[]) {
        dirPaths.forEach(dirPath => {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }


    /**
     * Checks if the supported environments (Node.js and Python) are installed and retrieves their versions.
     * @returns A promise that resolves to an object containing the installation status and version information for each environment.
     */
    public checkSupportedEnvironments(): Promise<{name: string, installed: boolean, version?: string}[]> {
        const checks = this.checkForSupportedEnvs.map(env => this.checkCommand(env));
        return Promise.all(checks).then(results => {
            const envStatus: {name: string, installed: boolean, version?: string }[] = [];
            this.checkForSupportedEnvs.forEach((env, index) => {
                envStatus.push({name: env, ...results[index] as { installed: boolean, version?: string }});
            });
            return envStatus;
        });
    }

    /**
     * Retrieves the list of available scripts for a given environment.
     * @param env The scripting environment (e.g., "node" or "python").
     * @returns An array of script file names that are available for the specified environment.
     */
    public getAvailableScripts(env: string): string[] {
        const scriptsDir = this.getScriptsDirectoryPath();
        const envDir = path.join(scriptsDir, env);
        if (!fs.existsSync(envDir)) {
            return [];
        }
        const files = fs.readdirSync(envDir);
        return files.filter(file => this.supportedScriptExtensions.includes(path.extname(file)));
    }

    private getPythonEnvironmentCommand(): Promise<string> {
        // check if python3 is available
        return new Promise((resolve) => {
            const proc = spawn("python3", ["--version"]);

            proc.on("error", () => {
                resolve("python"); // fallback
            });

            proc.on("close", (code) => {
                if (code === 0) {
                    resolve("python3");
                } else {
                    resolve("python");
                }
            });
        });
    }

    /**
     * Retrieves the content of a script file for a given environment and script name.
     * @param env The scripting environment (e.g., "node" or "python").
     * @param scriptName The name of the script file to read.
     * @returns A promise that resolves to the content of the script file as a string.
     */
    public readScriptContent(env: string, scriptName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const scriptsDir = this.getScriptsDirectoryPath();
            const scriptPath = path.join(scriptsDir, env, scriptName);
            if (!fs.existsSync(scriptPath)) {
                reject(new Error(`Script ${scriptName} not found for environment ${env}`));
                return;
            }
            fs.readFile(scriptPath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async executeScript(env: string, scriptName: string, args?: string[]): Promise<{ success: boolean, output: string }> {
        
        // if the environment is python, determine whether to use "python" or "python3" command based on availability
        const pythonCmd = env === 'python' ? await this.getPythonEnvironmentCommand() : 'python';

        return new Promise((resolve) => {
            const scriptsDir = this.getScriptsDirectoryPath();
            const scriptPath = path.join(scriptsDir, env, scriptName);
            if (!fs.existsSync(scriptPath)) {
                resolve({ success: false, output: `Script ${scriptName} not found for environment ${env}` });
                return;
            }
            const command = env === 'node' ? 'node' : env === 'python' ? pythonCmd : null;
            if (!command) {
                resolve({ success: false, output: `Unsupported environment: ${env}` });
                return;
            }
            const process = spawn(command, [scriptPath, ...(args || [])]);

            let output = "";
            let errorOutput = "";
            process.on("error", (err) => {
                errorOutput += err.message;
            });
            process.on("close", (code) => {
                resolve({ success: code === 0, output: output + errorOutput });
            });
            process.stdout.on("data", (data) => {
                output += data.toString();
            });
            process.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });
        });
    }


    private checkCommand(cmd: string, args = ["--version"]) {
        return new Promise((resolve) => {
            const process = spawn(cmd, args);

            let output = "";

            process.stdout.on("data", data => output += data.toString());
            process.stderr.on("data", data => output += data.toString());

            process.on("close", code => {
            if (code === 0) {
                resolve({ installed: true, version: output.trim() });
            } else {
                resolve({ installed: false });
            }
            });

        process.on("error", () => {
        resolve({ installed: false });
        });
    });
}


}