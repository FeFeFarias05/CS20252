import { URL } from 'url';

const JWKS_URI = process.env.JWKS_URI;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

if (!JWKS_URI || !JWT_ISSUER || !JWT_AUDIENCE) {
  console.warn('JWT_ISSUER, JWT_AUDIENCE or JWKS_URI not configured.');
}

let jwks: any = null;

async function getJwks() {
  if (!jwks) {
    const jose = await import('jose');
    jwks = jose.createRemoteJWKSet(new URL(JWKS_URI!));
  }
  return jwks;
}

export async function verifyJWT(token: string): Promise<any> {
  if (!token) throw new Error('Token missing');

  try {
    const jose = await import('jose');
    const { payload } = await jose.jwtVerify(token, await getJwks(), {
      issuer: JWT_ISSUER!,
      audience: JWT_AUDIENCE!,
    } as any);

    return payload;
  } catch (err: any) {
    throw new Error(`JWT verification failed: ${err?.message ?? String(err)}`);
  }
}
