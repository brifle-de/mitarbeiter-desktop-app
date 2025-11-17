/* eslint-disable @typescript-eslint/no-unused-vars */

import { ipcMain } from 'electron';
import * as net from 'net';

export default class PipeSocketService {

    private server: net.Server | null = null;


    constructor(private pipeName: string) {
    }

    public getPipeName(): string {
        return this.pipeName;
    }

    public getPipePath(): string {
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\${this.pipeName}`;
        } else {
            return `/tmp/${this.pipeName}.sock`;
        }
    }

    public init() {
        // Initialize the pipe socket connection
        try {
        this.server = net.createServer((stream) => {
            stream.on('data', (data) => {
                const message = data.toString();
                this.handleMessage(message);
            });
        })
        this.server.listen(this.getPipePath());
        } catch (error) {
            console.error("Failed to initialize PipeSocketService:", error);
        }
    }

    public close() {
        // Close the pipe socket connection
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    public handleMessage(message: string) {
        // Handle incoming messages through the pipe
        console.log('Received message through pipe:', message);
    }

}