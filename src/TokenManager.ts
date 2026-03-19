// src/config.ts
import { readFile, writeFile, mkdir } from 'fs/promises';
import type { DebugLogger } from './utils/DebugLogger.js';
await mkdir('tmp', { recursive: true });

export class TokenManager {
  private filePath: string;
  private logger: DebugLogger;

  constructor(filePath: string, logger: DebugLogger) {
    this.filePath = filePath;
    this.logger = logger;
  }

  async load(): Promise<{ token: string; exp: number | null }> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const data = JSON.parse(raw);
      this.logger.log('TokenManager.load: token letto da file', this.filePath);
      return { token: data.token, exp: data.exp };
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;

      if (error.code === 'ENOENT') {
        this.logger.log('TokenManager.load: nessun token salvato (usa --save per persistere)');
      } else {
        this.logger.error('TokenManager.load: errore lettura/parsing', error);
      }

      return { token: '', exp: null };
    }
  }

  async save(token: string, exp: number): Promise<void> {
    const data = JSON.stringify({ token, exp });
    await writeFile(this.filePath, data, 'utf8');
    this.logger.log('TokenManager.save: token salvato su file', this.filePath);
  }

  valid(exp: number | null): boolean {
    if (!exp) {
      this.logger.log('TokenManager.valid: exp mancante → token non valido');
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    const isValid = exp > now;
    this.logger.log('TokenManager.valid: exp =', exp, 'now =', now, 'valid =', isValid);
    return isValid;
  }
}
