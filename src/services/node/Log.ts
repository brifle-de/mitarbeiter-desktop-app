import { LogLevel, LogLevels } from "app/src-electron/log/types";

export default class Logger {
 
    public static async writeLog(level: string | LogLevel, message: string): Promise<void> {
        let lvl = LogLevel.INFO;
        // check if is string or LogLevel
        if (typeof level === 'string') {
            lvl = LogLevels.parse(level);
        } else {
            lvl = level;
        }
        await window.logApi.writeLog({ level: lvl, message });
    }

    /**
     * Log an info message 
     * @param message message to log
     */
    public static info(message: string): void {
        void this.writeLog(LogLevel.INFO, message);
    }

    /**
     * Log a warning message
     * @param message message to log
     */
    public static warn(message: string): void {
        void this.writeLog(LogLevel.WARN, message);
    }
    
    /**
     * Log an error message
     * @param message message to log
     */
    public static  error(message: string): void {
        void this.writeLog(LogLevel.ERROR, message);
    }
    /**
     * Log a debug message
     * @param message message to log
     */
    public static debug(message: string): void{
        void this.writeLog(LogLevel.DEBUG, message);
    }

}