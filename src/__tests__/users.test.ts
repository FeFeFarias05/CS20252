import { dynamoDBService } from '../lib/dynamodb';

describe('User CRUD Tests', () => {
  let testUserIds: string[] = [];

  afterEach(async () => {
    // Clean up test users
    for (const id of testUserIds) {
      try {
        await dynamoDBService.deleteClient(id);
      } catch (error) {
        console.warn(`Failed to delete test user ${id}:`, error);
      }
    }
    testUserIds = [];
  });

  // CREATE
  it('should create a user', async () => {
    const user = await dynamoDBService.createClient({
      name: 'Test User',
      email: 'test@example.com'
    });

    testUserIds.push(user.id);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  // READ
  it('should read a user', async () => {
    const created = await dynamoDBService.createClient({
      name: 'Read Test',
      email: 'read@example.com'
    });
    testUserIds.push(created.id);

    const user = await dynamoDBService.getClientById(created.id);

    expect(user).not.toBeNull();
    expect(user?.name).toBe('Read Test');
    expect(user?.email).toBe('read@example.com');
  });

  // UPDATE
  it('should update a user', async () => {
    const created = await dynamoDBService.createClient({
      name: 'Original',
      email: 'original@example.com'
    });
    testUserIds.push(created.id);

    const updated = await dynamoDBService.updateClient(created.id, {
      name: 'Updated'
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated');
    expect(updated?.email).toBe('original@example.com'); // email should remain unchanged
  });

  // DELETE
  it('should delete a user', async () => {
    const created = await dynamoDBService.createClient({
      name: 'Delete Test',
      email: 'delete@example.com'
    });

    const deleteResult = await dynamoDBService.deleteClient(created.id);
    expect(deleteResult).toBe(true);

    const deleted = await dynamoDBService.getClientById(created.id);
    expect(deleted).toBeNull();
  });
});
