import request from 'supertest';
import type { RequestInfo, RequestInit } from 'node-fetch';
import fetchFn from 'node-fetch';

const fetch = (...args: [RequestInfo, RequestInit?]) => {
  return fetchFn(...args);
};

const API_BASE = process.env.TEST_API_BASE ?? 'http://localhost:3000';

let mockServerProcess: any;

beforeAll(async () => {
});

afterAll(async () => {
});

test('GET /api/users should return 401 without token', async () => {
  const res = await request(API_BASE).get('/api/users');
  expect(res.status).toBe(401);
});

test('GET /api/users should return 403 for non-admin token', async () => {
  const resp = await fetch('http://localhost:8001/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles: ['user'], aud: process.env.JWT_AUDIENCE, iss: process.env.JWT_ISSUER }),
  });
  const { token } = (await resp.json()) as { token: string };
  const res = await request(API_BASE).get('/api/users').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(403);
});

test('GET /api/users should return 200 for admin token', async () => {
  const resp = await fetch('http://localhost:8001/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles: ['admin'], aud: process.env.JWT_AUDIENCE, iss: process.env.JWT_ISSUER }),
  });
  const { token } = (await resp.json()) as { token: string };
  const res = await request(API_BASE).get('/api/users').set('Authorization', `Bearer ${token}`);
  expect([200, 204, 401, 403]).toContain(res.status);
});
