import pkgUpdater from 'electron-updater';
import { app } from 'electron';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getAppDirectoryName } from '../const/AppConst';
const { autoUpdater } = pkgUpdater;

export interface UpdateInformation {
    version: string;
    releaseDate: string;
    releaseNotes?: string;
    isUpdateAvailable: boolean;
}

export type UpdateChannel = 'stable' | 'test';

export interface UpdateSettings {
    channel: UpdateChannel;
}

/** "ready": downloaded, installed on restart or quit */
export type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

export interface UpdateStatus {
    state: UpdateState;
    channel: UpdateChannel;
    /** the app can update itself (false for unpackaged dev builds and Linux installs without AppImage or deb) */
    supported: boolean;
    progressPercent?: number;
    error?: string;
}

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Updates come from GitHub Releases (brifle-de/mitarbeiter-desktop-app), see
 * .github/RELEASE.md:
 *  - stable: the release GitHub marks "latest". Release candidates are
 *    prereleases and never reach this channel.
 *  - test (Testkanal, opt-in): also release candidates.
 * Updates are downloaded in the background but only installed when the user
 * asks for it or quits the app, never in the middle of work.
 */
export default class AppUpdateService {

    private cachedUpdateInfo: pkgUpdater.UpdateCheckResult | null = null;
    private state: UpdateState = 'idle';
    private progressPercent: number | undefined;
    private lastError: string | undefined;
    private timer: NodeJS.Timeout | null = null;
    private settings: UpdateSettings = { channel: 'stable' };

    private settingsFile(): string {
        return path.join(os.homedir(), getAppDirectoryName(), 'update-settings.json');
    }

    private loadSettings(): UpdateSettings {
        try {
            const raw = JSON.parse(fs.readFileSync(this.settingsFile(), 'utf8')) as Partial<UpdateSettings>;
            return { channel: raw.channel === 'test' ? 'test' : 'stable' };
        } catch {
            return { channel: 'stable' };
        }
    }

    private saveSettings() {
        fs.mkdirSync(path.dirname(this.settingsFile()), { recursive: true });
        fs.writeFileSync(this.settingsFile(), JSON.stringify(this.settings, null, 2));
    }

    /** Linux updates only work for the AppImage and the .deb package. */
    private isSupported(): boolean {
        if (!app.isPackaged) {
            return false;
        }
        if (process.platform !== 'linux') {
            return true;
        }
        if (process.env.APPIMAGE) {
            return true;
        }
        try {
            const type = fs.readFileSync(path.join(process.resourcesPath, 'package-type'), 'utf8').trim();
            return type === 'deb';
        } catch {
            return false;
        }
    }

    private applyChannel() {
        const test = this.settings.channel === 'test';
        autoUpdater.allowPrerelease = test;
        // Leaving the test channel must be able to go back from x.y.z-rc.n to
        // the (lower or equal) stable version.
        autoUpdater.allowDowngrade = !test;
    }

    registerUpdateEvents() {
        this.settings = this.loadSettings();
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = true;
        autoUpdater.fullChangelog = false;
        this.applyChannel();

        autoUpdater.on('checking-for-update', () => { this.state = 'checking'; });
        autoUpdater.on('update-available', () => { this.state = 'downloading'; });
        autoUpdater.on('update-not-available', () => { this.state = 'idle'; });
        autoUpdater.on('download-progress', (p) => {
            this.state = 'downloading';
            this.progressPercent = Math.round(p.percent);
        });
        autoUpdater.on('update-downloaded', () => {
            this.state = 'ready';
            this.progressPercent = 100;
        });
        autoUpdater.on('error', (err) => {
            this.state = 'error';
            this.lastError = err?.message ?? String(err);
            console.error('Update error:', err);
        });

        if (this.timer === null) {
            this.timer = setInterval(() => { void this.refresh(); }, CHECK_INTERVAL_MS);
            this.timer.unref();
        }
    }

    /**
     * Installs a downloaded update now (the app restarts). Downloads it first
     * when the background download has not finished yet.
     */
    async downloadAndInstallUpdate() {
        if (!this.cachedUpdateInfo || !this.cachedUpdateInfo.isUpdateAvailable) {
            console.warn('No update available. Nothing to install.');
            return;
        }
        if (this.state !== 'ready') {
            await autoUpdater.downloadUpdate();
        }
        autoUpdater.quitAndInstall();
    }

    /**
     * Returns the update information if available.
     * @returns the update information
     */
    getUpdateInfo(): UpdateInformation | null {
        if (!this.cachedUpdateInfo || !this.cachedUpdateInfo.updateInfo) {
            return null;
        }
        const info = this.cachedUpdateInfo.updateInfo;
        const releaseNote = typeof info.releaseNotes === 'string' ? info.releaseNotes : (info.releaseNotes?.[0]?.note || '');
        return {
            isUpdateAvailable: this.cachedUpdateInfo.isUpdateAvailable,
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: releaseNote
        };
    }

    getStatus(): UpdateStatus {
        const status: UpdateStatus = {
            state: this.state,
            channel: this.settings.channel,
            supported: this.isSupported(),
        };
        if (this.progressPercent !== undefined) status.progressPercent = this.progressPercent;
        if (this.lastError !== undefined) status.error = this.lastError;
        return status;
    }

    getSettings(): UpdateSettings {
        return { ...this.settings };
    }

    /** switches the channel and checks for an update on the new channel right away */
    async setChannel(channel: UpdateChannel): Promise<UpdateStatus> {
        this.settings = { channel: channel === 'test' ? 'test' : 'stable' };
        this.saveSettings();
        this.applyChannel();
        await this.refresh();
        return this.getStatus();
    }

    async refresh() {
        if (!this.isSupported()) {
            this.cachedUpdateInfo = null;
            return;
        }
        this.lastError = undefined;
        this.cachedUpdateInfo = await autoUpdater.checkForUpdates().catch((err: Error) => {
            console.error('Error checking for updates:', err);
            this.state = 'error';
            this.lastError = err?.message ?? String(err);
            return null;
        });
    }

}
