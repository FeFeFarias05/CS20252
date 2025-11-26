import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './jwt';

interface AuthPayload {
  sub: string;
  roles?: string[];
  [key: string]: any;
}

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unauthorized' }, { status: 401 });
  }

  if (!payload.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return payload;
}

export async function requireSelfOrAdmin(req: NextRequest, userId: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unauthorized' }, { status: 401 });
  }

  if (payload.sub !== userId && !payload.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return payload;
}
