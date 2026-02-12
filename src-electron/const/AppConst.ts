const AppDirectoryName : string = 'brifle-business';
const AppPipeName : string = 'brifle-business-pipe';


function isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development';
}

function getAppDirectoryName(): string {
    if (isDevelopmentMode()) {
        return `${AppDirectoryName}-dev`;
    }
    return AppDirectoryName;
}

export { AppPipeName, getAppDirectoryName };

