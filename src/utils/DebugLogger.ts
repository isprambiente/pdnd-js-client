export class DebugLogger {
  constructor(private enabled: boolean) {}

  log(...args: any[]) {
    if (this.enabled) console.log('[DEBUG]', ...args);
  }
  info(...args: any[]) {
    if (this.enabled) console.info('[DEBUG][INFO]', ...args);
  }
  warn(...args: any[]) {
    if (this.enabled) console.warn('[DEBUG][WARN]', ...args);
  }
  error(...args: any[]) {
    if (this.enabled) console.error('[DEBUG][ERROR]', ...args);
  }
}
