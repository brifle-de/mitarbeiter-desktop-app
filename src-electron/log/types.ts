
export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug'
}

export class LogLevels {

    /**
     * Parse string to LogLevel enum
     * @param level string log level as string
     * @returns LogLevel
     */
    public static parse(level: string): LogLevel {
        switch (level.toLowerCase()) {
            case 'info':
                return LogLevel.INFO;
            case 'warn':
                return LogLevel.WARN;
            case 'error':
                return LogLevel.ERROR;
            case 'debug':
                return LogLevel.DEBUG;
            default:
                return LogLevel.INFO;
        }
    }
}

export interface LogOptions {
    message: string;
    level: LogLevel;
}