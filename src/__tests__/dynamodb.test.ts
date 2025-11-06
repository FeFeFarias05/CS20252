// import { dynamoDBService } from '../lib/dynamodb';

// describe('User CRUD Tests', () => {
//   let testUserIds: string[] = [];

//   afterEach(async () => {
//     for (const id of testUserIds) {
//       try { await dynamoDBService.deleteClient(id); } catch {}
//     }
//     testUserIds = [];
//   });

//   it('should create a user', async () => {
//     const user = await dynamoDBService.createClient({ name: 'Test', email: 'test@example.com' });
//     testUserIds.push(user.clientId);
//     expect(user.clientId).toBeDefined();
//     expect(user.name).toBe('Test');
//   });

//   // CREATE
//   it('should create a user', async () => {
//     const user = await dynamoDBService.createClient({
//       name: 'Test User',
//       email: 'test@example.com'
//     });

//     testUserIds.push(user.clientId);
//     expect(user.name).toBe('Test User');
//     expect(user.email).toBe('test@example.com');
//     expect(user.clientId).toBeDefined();
//     expect(user.createdAt).toBeDefined();
//   });

//   // READ
//   it('should read a user', async () => {
//     const created = await dynamoDBService.createClient({
//       name: 'Read Test',
//       email: 'read@example.com'
//     });
//     testUserIds.push(created.clientId);

//     const user = await dynamoDBService.getClientById(created.clientId);

//     expect(user).not.toBeNull();
//     expect(user?.name).toBe('Read Test');
//     expect(user?.email).toBe('read@example.com');
//   });

//   // UPDATE
//   it('should update a user', async () => {
//     const created = await dynamoDBService.createClient({
//       name: 'Original',
//       email: 'original@example.com'
//     });
//     testUserIds.push(created.clientId);

//     const updated = await dynamoDBService.updateClient(created.clientId, {
//       name: 'Updated'
//     });

//     expect(updated).not.toBeNull();
//     expect(updated?.name).toBe('Updated');
//     expect(updated?.email).toBe('original@example.com'); // email should remain unchanged
//   });

//   // DELETE
//   it('should delete a user', async () => {
//     const created = await dynamoDBService.createClient({
//       name: 'Delete Test',
//       email: 'delete@example.com'
//     });

//     const deleteResult = await dynamoDBService.deleteClient(created.clientId);
//     expect(deleteResult).toBe(true);

//     const deleted = await dynamoDBService.getClientById(created.clientId);
//     expect(deleted).toBeNull();
//   });
// });
