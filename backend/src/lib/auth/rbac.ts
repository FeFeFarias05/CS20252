import { Request, Response } from 'express';
import { verifyJWT } from './jwt';

interface AuthPayload {
  sub: string;
  roles?: string[];
  [key: string]: any;
}

// Helper to get authenticated user info
export async function getAuthInfo(req: Request): Promise<AuthPayload | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyJWT(token) as AuthPayload;
    return payload;
  } catch (err: any) {
    return null;
  }
}

export function isAdmin(auth: AuthPayload | null): boolean {
  return auth?.roles?.includes('admin') || false;
}

export function isOperator(auth: AuthPayload | null): boolean {
  return auth?.roles?.includes('operator') || auth?.roles?.includes('admin') || false;
}

export async function requireAdmin(req: Request): Promise<AuthPayload | Response> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null as any; // Will be handled by caller
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return null as any; // Will be handled by caller
  }

  if (!payload.roles?.includes('admin')) {
    return null as any; // Will be handled by caller
  }

  return payload;
}

export async function requireSelfOrAdmin(req: Request, userId: string): Promise<AuthPayload | Response> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null as any;
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return null as any;
  }

  if (payload.sub !== userId && !payload.roles?.includes('admin')) {
    return null as any;
  }

  return payload;
}

export async function requireOperator(req: Request): Promise<AuthPayload | Response | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return null;
  }

  if (!(payload.roles?.includes('operator') || payload.roles?.includes('admin'))) {
    return null;
  }

  return payload;
}

export async function requireRole(req: Request, role: string): Promise<AuthPayload | Response | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = await verifyJWT(token) as AuthPayload;
  } catch (err: any) {
    return null;
  }

  if (!payload.roles?.includes(role) && !payload.roles?.includes('admin')) {
    return null;
  }

  return payload;
}
