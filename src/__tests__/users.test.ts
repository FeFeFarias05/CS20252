import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User CRUD Tests', () => {
  let testUserIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    if (testUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } }
      });
      testUserIds = [];
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // CREATE
  it('should create a user', async () => {
    const user = await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com' }
    });

    testUserIds.push(user.id);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });

  // READ
  it('should read a user', async () => {
    const created = await prisma.user.create({
      data: { name: 'Read Test', email: 'read@example.com' }
    });
    testUserIds.push(created.id);

    const user = await prisma.user.findUnique({
      where: { id: created.id }
    });

    expect(user).not.toBeNull();
    expect(user?.name).toBe('Read Test');
  });

  // UPDATE
  it('should update a user', async () => {
    const created = await prisma.user.create({
      data: { name: 'Original', email: 'original@example.com' }
    });
    testUserIds.push(created.id);

    const updated = await prisma.user.update({
      where: { id: created.id },
      data: { name: 'Updated' }
    });

    expect(updated.name).toBe('Updated');
  });

  // DELETE
  it('should delete a user', async () => {
    const created = await prisma.user.create({
      data: { name: 'Delete Test', email: 'delete@example.com' }
    });

    await prisma.user.delete({
      where: { id: created.id }
    });

    const deleted = await prisma.user.findUnique({
      where: { id: created.id }
    });

    expect(deleted).toBeNull();
  });
});
