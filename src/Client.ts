import { DebugLogger } from './utils/DebugLogger.js';

export class Client {
  constructor(
    private cfg: { clientId: string },
    private opts: { debug?: boolean; verifySsl?: boolean },
    private logger: DebugLogger
  ) {}

  token: string = '';
  tokenExp: number | null = null;

  async getAccessToken(jwt: string, endpoint: string): Promise<{ jwt: string; token: string; exp: number }> {
    this.logger.log("Richiesta token a:", endpoint);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.cfg.clientId,
        client_assertion: jwt,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        grant_type: 'client_credentials'
      })
    });

    if (!res.ok) {
      this.logger.error("Errore token exchange:", res.status, await res.text());
      throw new Error(`Errore token exchange: ${res.status}`);
    }

    const data = await res.json();
    return {
      jwt, // includo anche il JWT
      token: data.access_token,
      exp: Math.floor(Date.now()/1000) + data.expires_in
    };
  }


  async requestApi(apiUrl: string, filters?: Record<string,string>) {
    const url = new URL(apiUrl);
    if (filters) Object.entries(filters).forEach(([k,v]) => url.searchParams.set(k,v));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'x-client-id': this.cfg.clientId
      }
    });
    return { status: res.status, body: await res.json() };
  }

  async checkStatus(statusUrl: string) {
    const res = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'x-client-id': this.cfg.clientId
      }
    });
    return { status: res.status, body: await res.json() };
  }
}
