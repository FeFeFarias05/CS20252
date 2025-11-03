import type { JWTPayload } from 'jose';

export type AuthInfo = {
  sub?: string;
  email?: string;
  roles: string[]; // normalizado
  raw: JWTPayload;
};

export function extractAuthInfo(payload: JWTPayload): AuthInfo {
  const raw = payload;
  const sub = String(payload.sub ?? '');
  const email = payload.email as string | undefined;

  let roles: string[] = [];

  if (Array.isArray((payload as any).roles)) {
    roles = (payload as any).roles;
  }

  if (!roles.length) {
    for (const k of Object.keys(payload)) {
      if (/role/i.test(k)) {
        const v = (payload as any)[k];
        if (Array.isArray(v)) roles = v;
        else if (typeof v === 'string') roles = v.split(/\s+/);
      }
    }
  }

  if (!roles.length && (payload as any).realm_access?.roles) {
    roles = (payload as any).realm_access.roles;
  }

  if (!roles.length && typeof payload.scope === 'string') {
    roles = (payload.scope as string).split(/\s+/);
  }

  roles = roles.map(String);

  return { sub, email, roles, raw };
}

export function isAdmin(auth: AuthInfo) {
  return auth.roles.includes('admin') || auth.roles.includes('Admin') || auth.roles.includes('administrator');
}

export function isSelfOrAdmin(auth: AuthInfo, resourceUserId: string) {
  if (isAdmin(auth)) return true;
  return String(auth.sub) === String(resourceUserId);
}
