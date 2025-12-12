#!/usr/bin/env npm
import { Command } from 'commander';
import { loadEnvConfig } from './Config.js';
import { TokenManager } from './TokenManager.js';
import { generateJwt } from './JWTGenerator.js';
import { Client } from './Client.js';
import { readFile } from 'fs/promises';
import { DebugLogger } from './utils/DebugLogger.js';

const program = new Command();
program
  .option('--config <file>', 'File di configurazione JSON')
  .option('--env <env>', 'Ambiente: collaudo o produzione')
  .option('--status-url <url>', 'URL di status')
  .option('--api-url <url>', 'API URL da chiamare')
  .option('--api-url-filters <filters>', 'Filtri query string')
  .option('--token-file <file>', 'File token', 'tmp/pdnd_token.json')
  .option('--debug', 'Mostra messaggi di debug')
  .option('--pretty', 'Output formattato')
  .option('--no-verify-ssl', 'Disabilita verifica SSL')
  .option('--save', 'Salva token');

program.parse();
const opts = program.opts();
const logger = new DebugLogger(opts.debug);

async function main() {
  logger.log('Opzioni parse:', opts);

  // Carica configurazione ambiente
  const cfg = await loadEnvConfig(opts.env, opts.config);
  logger.info('Config:', cfg);

  // Leggi chiave privata PEM
  const privKey: string = await readFile(cfg.privKeyPath, 'utf8');

  // Gestione token
  const tokenMgr = new TokenManager(opts.tokenFile, logger);
  let { token, exp } = await tokenMgr.load();

  // Se non valido, genera JWT e scambia con token vero
  if (!token || !tokenMgr.valid(exp)) {
    const { jwt, endpoint } = await generateJwt(
      privKey,
      { iss: cfg.issuer, clientId: cfg.clientId, purposeId: cfg.purposeId },
      cfg.kid,
      opts.env
    );

    logger.log("JWT generato:", jwt);

    const clientTmp = new Client(cfg, { debug: opts.debug, verifySsl: opts.verifySsl }, logger);
    const { token: accessToken, exp: newExp } = await clientTmp.getAccessToken(jwt, endpoint);

    logger.log("Access token ricevuto:", accessToken);

    token = accessToken;
    exp = newExp;

    if (opts.save) await tokenMgr.save(token, exp);
  }

  // Client con token vero
  const client = new Client(cfg, { debug: opts.debug, verifySsl: opts.verifySsl }, logger);
  client.token = token;
  client.tokenExp = exp ?? 0;

  // Status check
  if (opts.statusUrl) {
    const res = await client.checkStatus(opts.statusUrl);
    console.log(opts.pretty ? JSON.stringify(res.body, null, 2) : res.body);
  }

  // API call
  if (opts.apiUrl) {
    const filters = opts.apiUrlFilters
      ? Object.fromEntries(opts.apiUrlFilters.split('&').map((p: string) => {
          const [k,v] = p.split('=');
          return [k,v];
        }))
      : undefined;

    const res = await client.requestApi(opts.apiUrl, filters);
    console.log(opts.pretty ? JSON.stringify(res.body, null, 2) : res.body);
  }
}

main().catch(err => {
  logger.error('Errore:', err);
  process.exit(1);
});
