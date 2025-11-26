import { dynamoDBService } from '../lib/dynamodb';
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Pet";

const localClient = new DynamoDBClient({
  region: "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

describe('DynamoDB - CRUD Tests for Pets', () => {
  let testPetIds: string[] = [];

  beforeAll(async () => {
    if (process.env.NODE_ENV === 'test') return;

    try {
      await localClient.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [{ AttributeName: "petId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "petId", AttributeType: "S" }],
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
    for (const id of testPetIds) {
      try {
        await dynamoDBService.deletePet(id);
      } catch {}
    }
    testPetIds = [];
  });

  it('should create a pet', async () => {
    const pet = await dynamoDBService.createPet({ 
      nome: 'Rex', 
      foto: 'https://example.com/rex.jpg',
      idade: 3,
      raca: 'Labrador',
      peso: 25.5,
      medicacoes: 'Nenhuma',
      informacoes: 'Cachorro amigável'
    });
    testPetIds.push(pet.petId);
    expect(pet).toHaveProperty("petId");
    expect(pet.nome).toBe('Rex');
  });

  it('should read a pet', async () => {
    const created = await dynamoDBService.createPet({ 
      nome: 'Mia', 
      foto: '',
      idade: 2,
      raca: 'Siamês',
      peso: 4.5,
      medicacoes: '',
      informacoes: 'Gata calma'
    });
    testPetIds.push(created.petId);
    const pet = await dynamoDBService.getPetById(created.petId);
    expect(pet?.nome).toBe('Mia');
    expect(pet?.raca).toBe('Siamês');
  });

  it('should update a pet', async () => {
    const created = await dynamoDBService.createPet({ 
      nome: 'Bob', 
      foto: '',
      idade: 5,
      raca: 'Golden Retriever',
      peso: 30,
      medicacoes: '',
      informacoes: ''
    });
    testPetIds.push(created.petId);
    const updated = await dynamoDBService.updatePet(created.petId, { 
      peso: 32,
      medicacoes: 'Antipulgas mensais' 
    });
    expect(updated?.peso).toBe(32);
    expect(updated?.medicacoes).toBe('Antipulgas mensais');
  });

  it('should delete a pet', async () => {
    const created = await dynamoDBService.createPet({ 
      nome: 'Luna', 
      foto: '',
      idade: 1,
      raca: 'Persa',
      peso: 3.5,
      medicacoes: '',
      informacoes: ''
    });
    const deleted = await dynamoDBService.deletePet(created.petId);
    expect(deleted).toBe(true);
    const result = await dynamoDBService.getPetById(created.petId);
    expect(result).toBeNull();
  });
});
