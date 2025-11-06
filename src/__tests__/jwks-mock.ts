import { JWTPayload, SignJWT } from 'jose';
import nock from 'nock';

const JWKS_URL = 'http://localhost:8001/.well-known/jwks.json';

let privateKey: CryptoKey | undefined;

export async function startJwksMock() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );

  privateKey = keyPair.privateKey;

  const publicJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  nock('http://localhost:8001')
    .get('/.well-known/jwks.json')
    .reply(200, { keys: [publicJWK] });
}

export function stopJwksMock() {
  nock.cleanAll();
}

export async function getToken(payload: JWTPayload) {
  if (!privateKey) throw new Error('JWKS mock not started. Call startJwksMock first.');

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey);
}