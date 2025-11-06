import request from 'supertest';
import { getToken, startJwksMock, stopJwksMock } from '../testUtils/jwks-mock';
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
