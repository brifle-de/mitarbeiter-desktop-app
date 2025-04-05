enum ApiEnvironment {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
    INTERNAL = 'internal',
}

interface AccountData {
    id: string;
    apiKey: string;
    apiSecret: string;
    apiEnv: ApiEnvironment;
    name: string;
    sftpData?: SftpData[];
}

interface SftpData {
    host: string;
    port: number;
    username: string;
    password: string;
    displayName: string;
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