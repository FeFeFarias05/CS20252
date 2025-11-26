import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';
import { extractAuthInfo, AuthInfo } from './permissions';

export type AuthenticatedRequest = {
  req: NextRequest;
  auth: AuthInfo;
};

export async function requireAuth(req: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }
  const token = authHeader.split(' ')[1];
  const payload = await verifyJWT(token);
  const auth = extractAuthInfo(payload);
  return { req, auth };
}
