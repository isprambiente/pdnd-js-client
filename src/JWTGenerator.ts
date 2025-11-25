import { SignJWT, importPKCS8 } from 'jose';
import crypto from 'crypto';

export type Environment = 'collaudo' | 'produzione';
export const DEFAULT_ENV: Environment = 'produzione';

function configureEnvironment(env: Environment) {
  if (env === 'collaudo') {
    return {
      endpoint: 'https://auth.uat.interop.pagopa.it/token.oauth2',
      audience: 'auth.uat.interop.pagopa.it/client-assertion'
    };
  } else {
    return {
      endpoint: 'https://auth.interop.pagopa.it/token.oauth2',
      audience: 'auth.interop.pagopa.it/client-assertion'
    };
  }
}

export async function generateJwt(
  privKeyPem: string,
  payload: { iss: string; clientId: string; purposeId: string },
  kid: string,
  env: Environment = DEFAULT_ENV
): Promise<{ jwt: string; endpoint: string }> {
  const { endpoint, audience } = configureEnvironment(env);

  const privateKey = await importPKCS8(privKeyPem, 'RS256');
  const jwt = await new SignJWT({
      iss: payload.iss,
      sub: payload.clientId,
      purposeId: payload.purposeId,
      aud: audience,
      jti: crypto.randomUUID()
    })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);

  return { jwt, endpoint };
}
