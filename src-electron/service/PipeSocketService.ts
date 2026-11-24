/* eslint-disable @typescript-eslint/no-unused-vars */

import { ipcMain } from 'electron';
import * as net from 'net';
import * as fs from 'fs';

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
        const path = this.getPipePath();
        this.server = net.createServer((stream) => {
            stream.on('data', (data) => {
                this.handleMessage(data.toString());
            });
        });
        // An error here (e.g. the address is taken) must not crash the app:
        // the pipe is an optional integration point.
        this.server.on('error', (error) => {
            console.error('PipeSocketService:', error);
        });
        if (process.platform !== 'win32' && fs.existsSync(path)) {
            // A socket file left behind by a crashed run blocks listen() with
            // EADDRINUSE. The app is single-instance, so if nobody answers on
            // it, it is stale and can be removed.
            const probe = net.connect(path);
            probe.once('connect', () => {
                probe.destroy();
                console.warn(`PipeSocketService: ${path} is in use by another process; pipe disabled.`);
            });
            probe.once('error', () => {
                try { fs.unlinkSync(path); } catch { /* already gone */ }
                this.server?.listen(path);
            });
            return;
        }
        this.server.listen(path);
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