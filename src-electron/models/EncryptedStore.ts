enum ApiEnvironment {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
    INTERNAL = 'internal',
}

export class ApiEndpoints {
    static PRODUCTION = 'https://api.brifle.de';
    static SANDBOX = 'https://sandbox-api.brifle.de';
    static INTERNAL = 'https://internaltest-api.brifle.de';

    static getEndpoint(env: ApiEnvironment): string {
        switch (env) {
            case ApiEnvironment.PRODUCTION:
                return this.PRODUCTION;
            case ApiEnvironment.SANDBOX:
                return this.SANDBOX;
            case ApiEnvironment.INTERNAL:
                return this.INTERNAL;
            default:
                return this.PRODUCTION;
        }
    }
}

interface AccountData {
    id: string;
    apiKey?: string;
    apiSecret?: string;
    apiEnv: ApiEnvironment;
    tenantId?: string;
    name: string;
    sftpData?: SftpData[];
    // specify the remote server to use to handle the configuration    
    remoteServerUrl?: string;
}

interface SftpData {
    host: string;
    port: number;
    username: string;
    password: string;
    displayName: string;
    id: string;
}

interface EncryptedStoreType {
    isInitialized: boolean;
    passwordHash: string;    
    salt: string;
    version: string;
    accountIds: string[];
}

export type {
    AccountData,
    SftpData,
    EncryptedStoreType,    
}

export { ApiEnvironment };