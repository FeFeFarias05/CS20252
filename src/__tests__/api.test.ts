// import request from 'supertest';
// import { startJwksMock, stopJwksMock, getToken } from './jwks-mock';

// const API_BASE = process.env.TEST_API_BASE ?? 'http://localhost:3000';

// beforeAll(async () => {
//   await startJwksMock();
// });

// afterAll(async () => {
//   await stopJwksMock();
// });

// describe('Users API RBAC Tests', () => {
//   test('GET /api/users should return 401 without token', async () => {
//     const res = await request(API_BASE).get('/api/users');
//     expect(res.status).toBe(401);
//   });

//   test('GET /api/users should return 403 for non-admin token', async () => {
//     const token = getToken({ roles: ['user'] });
//     const res = await request(API_BASE)
//       .get('/api/users')
//       .set('Authorization', `Bearer ${token}`);
//     expect(res.status).toBe(403);
//   });

//   test('GET /api/users should return 200 for admin token', async () => {
//     const token = getToken({ roles: ['admin'] });
//     const res = await request(API_BASE)
//       .get('/api/users')
//       .set('Authorization', `Bearer ${token}`);
//     expect([200, 204]).toContain(res.status);
//   });

//   test('GET /api/users/:id should allow self or admin', async () => {
//     const userId = 'test-user-id';

//     // Test self
//     const selfToken = getToken({ roles: ['user'], sub: userId });
//     const selfRes = await request(API_BASE)
//       .get(`/api/users/${userId}`)
//       .set('Authorization', `Bearer ${selfToken}`);
//     expect([200, 404]).toContain(selfRes.status);

//     // Test admin
//     const adminToken = getToken({ roles: ['admin'] });
//     const adminRes = await request(API_BASE)
//       .get(`/api/users/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`);
//     expect([200, 404]).toContain(adminRes.status);

//     // Test other user
//     const otherToken = getToken({ roles: ['user'], sub: 'other-id' });
//     const otherRes = await request(API_BASE)
//       .get(`/api/users/${userId}`)
//       .set('Authorization', `Bearer ${otherToken}`);
//     expect(otherRes.status).toBe(403);
//   });

//   test('DELETE /api/users/:id should allow only admin', async () => {
//     const userId = 'test-user-id';
//     const userToken = getToken({ roles: ['user'] });
//     const adminToken = getToken({ roles: ['admin'] });

//     const userRes = await request(API_BASE)
//       .delete(`/api/users/${userId}`)
//       .set('Authorization', `Bearer ${userToken}`);
//     expect(userRes.status).toBe(403);

//     const adminRes = await request(API_BASE)
//       .delete(`/api/users/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`);
//     expect([204, 404]).toContain(adminRes.status);
//   });
// });
