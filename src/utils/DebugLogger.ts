export class DebugLogger {
  private enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  log(...args: unknown[]) {
    if (this.enabled) { console.log('[DEBUG]', ...args); }
  }

  info(...args: unknown[]) {
    if (this.enabled) { console.info('[DEBUG][INFO]', ...args); }
  }

  warn(...args: unknown[]) {
    if (this.enabled) { console.warn('[DEBUG][WARN]', ...args); }
  }

  error(...args: unknown[]) {
    if (this.enabled) { console.error('[DEBUG][ERROR]', ...args); }
  }
}