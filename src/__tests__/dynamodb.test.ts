import { dynamoDBService } from '../lib/dynamodb';
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Client";

const localClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

describe('DynamoDB - CRUD Tests', () => {
  let testUserIds: string[] = [];

  // ✅ Cria tabela antes de rodar os testes
  beforeAll(async () => {
    try {
      await localClient.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "clientId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "clientId", AttributeType: "S" }],
      }));
    } catch (err) {
      console.log("Table may already exist, continuing...");
    }
  }, 15000);

  // ✅ Remove tabela depois dos testes
  afterAll(async () => {
    try {
      await localClient.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
    } catch {}
  }, 15000);

  // ✅ Limpa registros após cada teste
  afterEach(async () => {
    for (const id of testUserIds) {
      try { await dynamoDBService.deleteClient(id); } catch {}
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
    expect(updated?.email).toBe('o@example.com');
  });

  it('should delete a user', async () => {
    const created = await dynamoDBService.createClient({ name: 'Delete', email: 'd@example.com' });

    const deleted = await dynamoDBService.deleteClient(created.clientId);
    expect(deleted).toBe(true);

    const result = await dynamoDBService.getClientById(created.clientId);
    expect(result).toBeNull();
  });
});
