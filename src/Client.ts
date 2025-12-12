import { DebugLogger } from './utils/DebugLogger.js';
import https from 'https';
import fetch, { RequestInit } from 'node-fetch';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class Client {
  private agent: https.Agent | undefined;

  constructor(
    private cfg: { clientId: string },
    private opts: { debug?: boolean; verifySsl?: boolean },
    private logger: DebugLogger
  ) {
    if (opts.verifySsl === false) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      this.agent = new https.Agent({ rejectUnauthorized: false });
      this.logger.log("⚠️ Verifica SSL disabilitata: usare solo in ambienti di test!");
    }
  }

  token: string = '';
  tokenExp: number | null = null;

  async getAccessToken(jwt: string, endpoint: string): Promise<{ jwt: string; token: string; exp: number }> {
    this.logger.log("Richiesta token a:", endpoint);

    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.cfg.clientId,
        client_assertion: jwt,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        grant_type: 'client_credentials'
      }) as any,
      agent: this.agent
    };

    const res = await fetch(endpoint, init);

    if (!res.ok) {
      this.logger.error("Errore token exchange:", res.status, await res.text());
      throw new Error(`Errore token exchange: ${res.status}`);
    }

    const data = (await res.json()) as TokenResponse;

    this.token = data.access_token;
    this.tokenExp = Math.floor(Date.now() / 1000) + data.expires_in;

    return {
      jwt,
      token: this.token,
      exp: this.tokenExp
    };
  }

  async requestApi(apiUrl: string, filters?: Record<string, string>) {
    const url = new URL(apiUrl);
    if (filters) Object.entries(filters).forEach(([k, v]) => url.searchParams.set(k, v));

    const init: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'x-client-id': this.cfg.clientId
      },
      agent: this.agent
    };

    const res = await fetch(url.toString(), init);
    return { status: res.status, body: await res.json() };
  }

  async checkStatus(statusUrl: string) {
    const init: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'x-client-id': this.cfg.clientId
      },
      agent: this.agent
    };

    this.logger.info("Status Url:", statusUrl);
    const res = await fetch(statusUrl, init);
    return { status: res.status, body: await res.json() };
  }
}