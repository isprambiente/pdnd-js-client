# pdnd-js-client

Client JavaScript/TypeScript per autenticazione e interazione con le API della Piattaforma Digitale Nazionale Dati (PDND).

Basato sugli esempi dei client Ruby e Python, questo package fornisce:
- utilità per generare JWT firmati: src/JWTGenerator.ts
- gestione token locale: src/TokenManager.ts
- client HTTP per lo scambio JWT→access token e per chiamare le API: src/Client.ts
- CLI per uso da riga di comando: src/cli.ts

Link rapidi:
- Codice sorgente: src/JWTGenerator.ts, src/TokenManager.ts, src/Client.ts, src/Config.ts
- CLI: src/cli.ts
- Test di esempio: test/jwt.test.ts
- Config di esempio: configs/sample.json
- package: package.json

Linguaggi e strumenti
- Linguaggi: TypeScript e JavaScript
- Runtime: Bun (consigliato) o Node.js (>= 18)
- Transpilazione: TypeScript (tsc)
- Test runner: Vitest
- Bundler / toolchain: Bun / npm as fallback

Requisiti
- Bun (consigliato) o Node 18+
- TypeScript (dev dependency)

Installazione
1. Clona il repository.
2. Installa le dipendenze (scegli Bun o npm):
```sh
# con Bun (consigliato)
bun install

# con npm
npm install
```

Compilazione (build)
- Il progetto usa TypeScript: compila con tsc.
```sh
# con Bun
bun run build

# con npm
npm run build
```

Esecuzione test
- Test eseguiti con Vitest.
```sh
# con Bun
bun run test

# con npm
npm run test
```

Uso CLI
Il CLI è avviabile direttamente (shebang in src/cli.ts). Esempio base (usa configs/sample.json se non ne fornisci uno):
```sh
bun run src/cli.ts --env collaudo --config configs/sample.json --status-url https://api.example/status
```

Opzioni CLI (tutte)
- --config <file>         : File di configurazione JSON
- --env <env>             : Ambiente — "collaudo" o "produzione"
- --status-url <url>      : URL di status da richiamare
- --api-url <url>         : API URL da chiamare
- --api-url-filters <f>   : Filtri query string (formato key1=val1&key2=val2)
- --token-file <file>     : File token (default: tmp/pdnd_token.json)
- --debug                 : Mostra messaggi di debug (DebugLogger)
- --pretty                : Output JSON formattato
- --no-verify-ssl         : Disabilita verifica SSL per le chiamate HTTP
- --save                  : Salva il token (usando TokenManager)

Esempi d'uso CLI completi
# Richiesta status (output compatto)
bun run src/cli.ts --env collaudo --config configs/sample.json --status-url https://api.example/status

# Chiamata API con filtri e output formattato
bun run src/cli.ts --env produzione --config configs/prod.json --api-url https://api.example/resource --api-url-filters "q=term&limit=10" --pretty

# Disabilitare verify SSL e salvare il token
bun run src/cli.ts --env collaudo --config configs/sample.json --api-url https://api.example/resource --no-verify-ssl --save

Formato di configurazione
La funzione loadEnvConfig (src/Config.ts) carica un file JSON con la struttura per ciascun ambiente. Ogni ambiente (`collaudo`/`produzione`) deve contenere:
- kid
- issuer
- clientId
- purposeId
- privKeyPath

Esempio:
```json
{
  "collaudo": {
    "kid": "kid",
    "issuer": "issuer",
    "clientId": "clientId",
    "purposeId": "purposeId",
    "privKeyPath": "/tmp/key.pem"
  },
  "produzione": { }
}
```

API programmatica
- Generare JWT:
  - funzione: src/JWTGenerator.ts → generateJwt
  - genera un JWT RS256 firmato partendo da una chiave privata PEM
- Scambiare JWT per un access token:
  - metodo: src/Client.ts → getAccessToken
  - invia POST a endpoint token con grant_type `client_credentials` e ritorna token ed expiry
- Gestione token persistente:
  - classe: src/TokenManager.ts
  - supporta load(), save(token, exp) e valid(exp) per riutilizzare token salvati in tmp/pdnd_token.json (o percorso custom)

Integrazione in un progetto
- Installazione come dipendenza:
  - Se il pacchetto è pubblicato su npm:
    ```sh
    npm install pdnd-js-client
    # oppure
    bun add pdnd-js-client
    ```
  - Direttamente da GitHub:
    ```sh
    npm install github:isprambiente/pdnd-js-client
    # oppure
    bun add github:isprambiente/pdnd-js-client
    ```
  - Da percorso locale (se lavori sul repository):
    ```sh
    # all'interno del progetto che consumerà la libreria
    npm install ../path/to/js-client
    # o con bun
    bun add ../path/to/js-client
    ```

- Import e utilizzo (ESM / TypeScript)
  - Import dei moduli principali:
    ```ts
    import { generateJwt } from 'pdnd-js-client';
    import { Client } from 'pdnd-js-client';
    import { TokenManager } from 'pdnd-js-client';
    ```
  - Esempio d'uso semplificato:
    ```ts
    // genera jwt usando la config dell'ambiente
    const jwt = await generateJwt({
      issuer: 'https://issuer.example',
      clientId: 'client-id',
      purposeId: 'purpose-id',
      privKeyPath: '/path/to/key.pem',
      kid: 'key-id'
    });

    const client = new Client({ tokenEndpoint: 'https://api.example/token' });
    const tokenResponse = await client.getAccessToken(jwt);

    // gestione persistente
    const tm = new TokenManager({ file: './tmp/pdnd_token.json' });
    if (!tm.valid(tokenResponse.expires_at)) {
      tm.save(tokenResponse.access_token, tokenResponse.expires_at);
    }
    ```

- Import CommonJS
  ```js
  const { generateJwt, Client, TokenManager } = require('pdnd-js-client');
  ```

Test
Un test di esempio per la generazione JWT è presente in test/jwt.test.ts. Esegui i test locali con:
```sh
bun run test
# oppure
npm run test
```

Contribuire
PR e issue sono benvenuti. Assicurati che i test passino e segui gli standard del progetto:
```sh
bun run test
bun run lint

# oppure con npm
npm run test
npm run lint
```

Licenza
La licenza è presente nel file LICENSE del repository. Controlla lì per i termini specifici.

Contribuire

Le pull request sono benvenute! Per problemi o suggerimenti, apri una issue.