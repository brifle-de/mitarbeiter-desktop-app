import path from 'node:path';
import { LogLevel } from './types';
import { app } from 'electron';

export interface LogConfig {
    level: LogLevel;
    filePath: string;
    logDir: string;
}



// read path of app data directory
const homeDir = app.getPath('home');

const basePath: string = path.join(homeDir, 'brifle-business','logs')

const defaultLogConfig: LogConfig = {
    level: LogLevel.INFO,
    filePath: "app.log",
    logDir: basePath
};

export default defaultLogConfig;
