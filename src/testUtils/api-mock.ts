import nock from 'nock';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const buff = Buffer.from(padded, 'base64');
    return JSON.parse(buff.toString('utf8'));
  } catch (e) {
    return null;
  }
}

let scope: nock.Scope | null = null;

export function startApiMock(base = 'http://localhost:3000') {
  scope = nock(base)
    .persist()
    .get('/api/users')
    .reply(function () {
      const auth = this.req.headers['authorization'] as string | undefined;
      if (!auth) return [401, ''];
      const token = auth.split(' ')[1];
      const payload = decodeJwtPayload(token);
      const roles: string[] = payload?.roles || [];
      if (roles.includes('admin')) return [200, []];
      return [403, ''];
    })

    .get(/\/api\/users\/[^/]+$/)
    .reply(function (uri) {
      const auth = this.req.headers['authorization'] as string | undefined;
      if (!auth) return [401, ''];
      const token = auth.split(' ')[1];
      const payload = decodeJwtPayload(token);
      const roles: string[] = payload?.roles || [];
      const sub = payload?.sub;
      const id = uri.split('/').pop();
      if (roles.includes('admin')) return [200, {}];
      if (sub && sub === id) return [200, {}];
      return [403, ''];
    })

    .delete(/\/api\/users\/[^/]+$/)
    .reply(function () {
      const auth = this.req.headers['authorization'] as string | undefined;
      if (!auth) return [401, ''];
      const token = auth.split(' ')[1];
      const payload = decodeJwtPayload(token);
      const roles: string[] = payload?.roles || [];
      if (roles.includes('admin')) return [204, ''];
      return [403, ''];
    });
}

export function stopApiMock() {
  if (scope) {
    nock.cleanAll();
    scope = null;
  }
}
