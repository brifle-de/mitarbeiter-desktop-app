/**
 * Forwards console output and uncaught errors of the renderer to the main
 * process log (window.logApi), as the inline script in the old index.html did.
 */
import { LogLevel } from 'app/src-electron/log/types';

type Level = 'info' | 'warn' | 'error' | 'debug';
const LEVELS: Record<Level, LogLevel> = { info: LogLevel.INFO, warn: LogLevel.WARN, error: LogLevel.ERROR, debug: LogLevel.DEBUG };

function serialize(args: unknown[]): string {
  return args.map((arg) => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.stack || arg.message;
    try { return JSON.stringify(arg); } catch { return '[Unable to serialize object]'; }
  }).join(' ');
}

function send(level: Level, args: unknown[]) {
  void window.logApi?.writeLog({ level: LEVELS[level], message: serialize(args) });
}

export function installConsoleForwarding() {
  for (const level of ['info', 'warn', 'error', 'debug'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => { original(...args); send(level, args); };
  }
  window.addEventListener('error', (event) => {
    send('error', [event.error ?? { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno }]);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason;
    send('error', [{ unhandledRejection: true, reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason }]);
  });
}
