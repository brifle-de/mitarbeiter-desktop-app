import pkgUpdater from 'electron-updater';
const { autoUpdater } = pkgUpdater;

export interface UpdateInformation {
    version: string;
    releaseDate: string;
    releaseNotes?: string;
    isUpdateAvailable: boolean;
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
     * Initiates the download of the update if update information is available.
     * If no update information is cached, it logs a warning and does nothing.
     */
    downloadUpdate() {
        if (this.cachedUpdateInfo && this.cachedUpdateInfo.updateInfo) {
            return autoUpdater.downloadUpdate();
        } else {
            console.warn("No update information available. Cannot download update.");
            return Promise.resolve();
        }
    }

    /**
     * Initiates the download and installation of the update if update information is available.
     * If no update information is cached, it logs a warning and does nothing.
     */
    downloadAndInstallUpdate() {
        if (this.cachedUpdateInfo && this.cachedUpdateInfo.updateInfo) {
            return autoUpdater.downloadUpdate().then(() => {
                autoUpdater.quitAndInstall();
            });
        } else {
            console.warn("No update information available. Cannot download and install update.");
            return Promise.resolve();
        }
    }

    /**
     * Returns the update information if available.
     * @returns the update information
     */
    getUpdateInfo(): UpdateInformation | null {
        if(!this.cachedUpdateInfo || !this.cachedUpdateInfo.updateInfo) {
            return null;
        }
        const info = this.cachedUpdateInfo.updateInfo;
        const releaseNote = typeof info.releaseNotes === "string" ? info.releaseNotes : (info.releaseNotes?.[0]?.note || "");
        return {
            isUpdateAvailable: this.cachedUpdateInfo.isUpdateAvailable,
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
        autoUpdater.fullChangelog= false;
        this.cachedUpdateInfo = await autoUpdater.checkForUpdates().catch(err => {
            console.error("Error checking for updates:", err);
            return null;
        });
    }
 
}


