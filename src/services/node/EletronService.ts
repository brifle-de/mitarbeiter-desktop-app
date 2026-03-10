export default class EletronService {

    async getPlatform(): Promise<string> {
        return await window.electronApi.getPlatform();
    }

    async getAppVersion(): Promise<string> {
        return await window.electronApi.getAppVersion();
    }

    async showDevTools(): Promise<void> {
        return await window.electronApi.showDevTools();
    }

    async getUpdateInfo() {
        return await window.electronApi.getUpdateInfo();
    }
    async downloadAndInstallUpdate() {
        return await window.electronApi.downloadAndInstallUpdate();
    }
}