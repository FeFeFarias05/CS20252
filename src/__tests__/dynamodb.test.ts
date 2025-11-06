import { dynamoDBService } from '../lib/dynamodb';
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Client";

const localClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

describe('DynamoDB - CRUD Tests', () => {
  let testUserIds: string[] = [];

  beforeAll(async () => {
    if (process.env.NODE_ENV === 'test') return;

    try {
      await localClient.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "clientId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "clientId", AttributeType: "S" }],
      }));
      await new Promise(res => setTimeout(res, 2000)); 
    } catch (err) {
      console.error('Error creating local DynamoDB table in beforeAll:', err);
      throw err; 
    }
  }, 30000);

  afterAll(async () => {
    if (process.env.NODE_ENV === 'test') return;

    try {
      await localClient.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    } catch {}
  }, 30000);

  afterEach(async () => {
    for (const id of testUserIds) {
      try {
        await dynamoDBService.deleteClient(id);
      } catch {}
    }
    testUserIds = [];
  });

  it('should create a user', async () => {
    const user = await dynamoDBService.createClient({ name: 'Test One', email: 't1@example.com' });
    testUserIds.push(user.clientId);
    expect(user).toHaveProperty("clientId");
  });

  it('should read a user', async () => {
    const created = await dynamoDBService.createClient({ name: 'Read', email: 'r@example.com' });
    testUserIds.push(created.clientId);
    const user = await dynamoDBService.getClientById(created.clientId);
    expect(user?.name).toBe('Read');
  });

  it('should update a user', async () => {
    const created = await dynamoDBService.createClient({ name: 'Old', email: 'o@example.com' });
    testUserIds.push(created.clientId);
    const updated = await dynamoDBService.updateClient(created.clientId, { name: 'New Name' });
    expect(updated?.name).toBe('New Name');
  });

  it('should delete a user', async () => {
    const created = await dynamoDBService.createClient({ name: 'Delete', email: 'd@example.com' });
    const deleted = await dynamoDBService.deleteClient(created.clientId);
    expect(deleted).toBe(true);
    const result = await dynamoDBService.getClientById(created.clientId);
    expect(result).toBeNull();
  });
});
