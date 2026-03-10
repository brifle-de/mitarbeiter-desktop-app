import pkgUpdater from 'electron-updater';
const { autoUpdater } = pkgUpdater;

export interface UpdateInformation {
    version: string;
    releaseDate: string;
    releaseNotes?: string;
}

export default class AppUpdateService {

    private cachedUpdateInfo: pkgUpdater.UpdateCheckResult | null = null;
  

    registerUpdateEvents() {
        autoUpdater.on("checking-for-update", () => {});
        autoUpdater.on("update-available", (details) => {
            console.log("Update available:", details);
        });
        autoUpdater.on("update-not-available", () => {});
        autoUpdater.on("update-downloaded", () => {
            autoUpdater.quitAndInstall();
        });
    }

    /**
     * 
     * @returns the update information
     */
    getUpdateInfo(): UpdateInformation | null {
        if(!this.cachedUpdateInfo || !this.cachedUpdateInfo.updateInfo) {
            return null;
        }
        const info = this.cachedUpdateInfo.updateInfo;
        const releaseNote = typeof info.releaseNotes === "string" ? info.releaseNotes : (info.releaseNotes?.[0]?.note || "");
        return {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: releaseNote
        };
    }

    async refresh() {
        autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'brifle-de',
            repo: 'mitarbeiter-desktop-app'
        });
        autoUpdater.forceDevUpdateConfig = true;
        autoUpdater.allowPrerelease = true;
        autoUpdater.fullChangelog= false;
        this.cachedUpdateInfo = await autoUpdater.checkForUpdates().catch(err => {
            console.error("Error checking for updates:", err);
            return null;
        });
        console.log("Update check result:", this.cachedUpdateInfo);
    }

}


