const AppDirectoryName : string = 'brifle-business';
const AppPipeName : string = 'brifle-business-pipe';


function isDevelopmentMode(): boolean {
    // electron-vite: true for `npm run dev`, false in packaged builds
    return import.meta.env.DEV;
}

function getAppDirectoryName(): string {
    if (isDevelopmentMode()) {
        return `${AppDirectoryName}-dev`;
    }
    return AppDirectoryName;
}

export { AppPipeName, getAppDirectoryName };

