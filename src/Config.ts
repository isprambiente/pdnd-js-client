// src/config.ts
import { readFile } from 'fs/promises';
import path from 'path';

export type EnvConfig = {
  kid: string;
  issuer: string;
  clientId: string;
  purposeId: string;
  privKeyPath: string;
  tokenUrl: string;   // aggiunto
};

export type PDNDConfigFile = {
  collaudo: EnvConfig;
  produzione: EnvConfig;
};

export async function loadEnvConfig(
  env: 'collaudo' | 'produzione',
  filePath = 'configs/sample.json'
): Promise<EnvConfig> {
  const raw = await readFile(path.resolve(filePath), 'utf8');
  const cfg = JSON.parse(raw) as PDNDConfigFile;
  return cfg[env];
}