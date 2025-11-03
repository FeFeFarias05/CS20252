import request from 'supertest';
import { setupJWKSMock, signToken } from './jwks-mock';

const API_BASE = process.env.TEST_API_BASE ?? 'http://localhost:3000';

beforeAll(async () => {
  await setupJWKSMock();
});

test('GET /api/users should return 401 without token', async () => {
  const res = await request(API_BASE).get('/api/users');
  expect(res.status).toBe(401);
});

test('GET /api/users should return 403 for non-admin token', async () => {
  const token = await signToken({ roles: ['user'], aud: process.env.JWT_AUDIENCE, iss: process.env.JWT_ISSUER });
  const res = await request(API_BASE).get('/api/users').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(403);
});

test('GET /api/users should return 200 for admin token', async () => {
  const token = await signToken({ roles: ['admin'], aud: process.env.JWT_AUDIENCE, iss: process.env.JWT_ISSUER });
  const res = await request(API_BASE).get('/api/users').set('Authorization', `Bearer ${token}`);
  expect([200, 204]).toContain(res.status);
});
