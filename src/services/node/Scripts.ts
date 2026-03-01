export default class Scripts {
    
    getSupportedScriptEnvironments(): Promise<{name: string, version: string, installed: boolean}[]> {
        return window.scriptsApi.getSupportedScriptEnvironments();
    }
    getAvailableScripts(env: string): Promise<string[]> {
        return window.scriptsApi.getAvailableScripts(env);
    }
    getAllScriptExtensions(): Promise<string[]> {
        return window.scriptsApi.getAllScriptExtensions();
    }
    readScriptContent(env: string, scriptName: string): Promise<string> {
        return window.scriptsApi.readScriptContent(env, scriptName);
    }
    executeScript(env: string, scriptName: string, args?: string[]): Promise<{ success: boolean, output: string }> {
        return window.scriptsApi.executeScript(env, scriptName, args);
    }
}