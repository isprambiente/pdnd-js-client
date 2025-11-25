import { describe, it, expect } from 'vitest';
import { generateJwt } from '../src/JWTGenerator.js';
import { readFileSync } from 'fs';
import path from 'path';

describe('JWTGenerator', () => {
  const privKeyPath = path.resolve('keys/test.rsa.priv');
  const privKeyPem = readFileSync(privKeyPath, 'utf8');

  const payload = {
    iss: 'test-issuer',
    purposeId: 'test-purpose'
  };
  const kid = 'test-kid';

  it('genera un JWT valido in ambiente collaudo', async () => {
    const { jwt, endpoint } = await generateJwt(privKeyPem, payload, kid, 'collaudo');

    expect(endpoint).toBe('https://auth.uat.interop.pagopa.it/token.oauth2');
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.')).toHaveLength(3); // JWT ha 3 parti
  });

  it('genera un JWT valido in ambiente produzione', async () => {
    const { jwt, endpoint } = await generateJwt(privKeyPem, payload, kid, 'produzione');

    expect(endpoint).toBe('https://auth.interop.pagopa.it/token.oauth2');
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.')).toHaveLength(3);
  });
});
