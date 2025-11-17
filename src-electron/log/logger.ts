import winston from "winston";

import config, { LogConfig }  from "./config";
import path from "node:path";
import fs from "fs";
import { app } from "electron";
import { LogLevel } from "./types";
import { AppDirectoryName } from "../const/AppConst";


const homeDir = app.getPath('home');
const defaultLogDir = path.join(homeDir, AppDirectoryName,'logs')
const logDir = config.logDir ? config.logDir : defaultLogDir;
const logConfigPath = path.join(logDir, 'logs.config.json');
const defaultConfig : LogConfig = {
    level: LogLevel.INFO,
    filePath: 'app.log',
    logDir: defaultLogDir
}

export function ensureConfig() : LogConfig{
    // ensure home directory exists
    if (!fs.existsSync(homeDir)) {
        fs.mkdirSync(homeDir, { recursive: true });
    }
    // ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    // ensure log config file exists
    if (!fs.existsSync(logConfigPath)) {
        const content = JSON.stringify(defaultConfig, null, 2);
        fs.writeFileSync(logConfigPath, content, 'utf-8');
    }
    // read log config file if it exists
    const configData = fs.readFileSync(logConfigPath, 'utf-8');
    try {
        const userConfig = JSON.parse(configData) as LogConfig;
        // merge user config with default config
        return userConfig;
     
    } catch (e: unknown) {
        console.error("Error reading log config file, using default config", e);
        // if error, write default config to file
        const content = JSON.stringify(defaultConfig, null, 2);
        fs.writeFileSync(logConfigPath, content, 'utf-8');
        return defaultConfig;
    }
}

const conf = ensureConfig();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: conf.filePath, dirname: conf.logDir}),
  ],
  level: conf.level,
});

export default logger;