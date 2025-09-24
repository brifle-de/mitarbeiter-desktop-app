
import logger from "../log/logger";
import { LogOptions } from "../log/types";

export default class LogService {

    static writeLog(opts: LogOptions): boolean {        
        try {
            logger.log(opts.level, opts.message);
            return true;
        } catch (error) {
            console.error("Failed to write log:", error);
            return false;
        }
    }
}