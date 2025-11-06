import request from 'supertest';
import { startJwksMock, stopJwksMock, getToken } from '../testUtils/jwks-mock';
import { startApiMock, stopApiMock } from '../testUtils/api-mock';

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:3000';

beforeAll(async () => {
  await startJwksMock();
  startApiMock();
});

afterAll(async () => {
  await stopJwksMock();
  stopApiMock();
});

describe('Users API RBAC Tests', () => {
  test('GET /api/users should return 401 without token', async () => {
    const res = await request(API_BASE).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/users should return 403 for non-admin token', async () => {
    const token = await getToken({ roles: ['user'] });
    const res = await request(API_BASE)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('GET /api/users should return 200 for admin token', async () => {
    const token = await getToken({ roles: ['admin'] });
    const res = await request(API_BASE)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.status);
  });

  test('GET /api/users/:id should allow self or admin', async () => {
    const userId = 'test-user';
    const selfToken = await getToken({ roles: ['user'], sub: userId });
    const adminToken = await getToken({ roles: ['admin'] });
    const otherToken = await getToken({ roles: ['user'], sub: 'other-id' });

    const selfRes = await request(API_BASE)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${selfToken}`);
    expect([200, 404]).toContain(selfRes.status);

    const adminRes = await request(API_BASE)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404]).toContain(adminRes.status);

    const otherRes = await request(API_BASE)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(otherRes.status).toBe(403);
  });

  test('DELETE /api/users/:id should allow only admin', async () => {
    const userId = 'test-user';
    const userToken = await getToken({ roles: ['user'] });
    const adminToken = await getToken({ roles: ['admin'] });

    const userRes = await request(API_BASE)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(userRes.status).toBe(403);

    const adminRes = await request(API_BASE)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([204, 404]).toContain(adminRes.status);
  });
});
