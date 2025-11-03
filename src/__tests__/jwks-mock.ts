import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import nock from 'nock';

const JWKS_URL = 'http://localhost:8001/.well-known/jwks.json';

let privateKey: CryptoKey;

export async function setupJWKSMock() {
  privateKey = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );

  const publicJWK = await crypto.subtle.exportKey('jwk', privateKey);

  nock('http://localhost:8001')
    .get('/.well-known/jwks.json')
    .reply(200, { keys: [publicJWK] });
}

export async function signToken(payload: object) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey);
}
