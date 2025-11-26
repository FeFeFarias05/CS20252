import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "node:crypto";

const isTest = process.env.NODE_ENV === "test";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || (isTest ? "http://localhost:8000" : undefined),
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});


let dynamodb: any;

if (isTest) {
  const store = new Map<string, any>();

  dynamodb = {
    send: async (command: any) => {
      const name = command.constructor && command.constructor.name;
      const input = command.input || {};

      if (name === 'PutCommand') {
        const item = input.Item;
        if (!item || !item.petId) throw new Error('Invalid item');
        store.set(item.petId, item);
        return {};
      }

      if (name === 'GetCommand') {
        const key = input.Key;
        const item = key && store.get(key.petId);
        return { Item: item };
      }

      if (name === 'ScanCommand') {
        return { Items: Array.from(store.values()) };
      }

      if (name === 'UpdateCommand') {
        const key = input.Key;
        const petId = key && key.petId;
        const existing = store.get(petId);
        if (!existing) return { Attributes: undefined };

        const values = input.ExpressionAttributeValues || {};
        const names = input.ExpressionAttributeNames || {};

        // Apply updates: map :val tokens to real attribute names via names mapping
        for (const [valKey, val] of Object.entries(values)) {
          const token = (valKey as string).replace(/^:/, '');
          const nameKey = `#${token}`;
          const realName = names[nameKey] || token;
          existing[realName] = val as any;
        }

        store.set(petId, existing);
        return { Attributes: existing };
      }

      if (name === 'DeleteCommand') {
        const key = input.Key;
        const petId = key && key.petId;
        store.delete(petId);
        return {};
      }

      throw new Error(`MockDynamoDB: unsupported command ${name}`);
    },
  };
} else {
  dynamodb = DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Pet";

export interface Pet {
  petId: string;
  nome: string;
  foto: string;
  idade: number;
  raca: string;
  peso: number;
  medicacoes: string;
  informacoes: string;
  createdAt: string;
}

export class DynamoDBService {
  async getAllPets(): Promise<Pet[]> {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await dynamodb.send(command);
    return (response.Items as Pet[]) || [];
  }

  async createPet(
    pet: Omit<Pet, "petId" | "createdAt">
  ): Promise<Pet> {
    const newPet: Pet = {
      petId: crypto.randomUUID(),
      ...pet,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newPet,
    });

    await dynamodb.send(command);
    return newPet;
  }

  async getPetById(petId: string): Promise<Pet | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { petId },
    });

    const response = await dynamodb.send(command);
    return (response.Item as Pet) || null;
  }

  async updatePet(
    petId: string,
    updates: Partial<Omit<Pet, "petId" | "createdAt">>
  ): Promise<Pet | null> {
    const updateExpression = [];
    const attributeValues: any = {};
    const attributeNames: any = {};

    for (const [key, value] of Object.entries(updates)) {
      updateExpression.push(`#${key} = :${key}`);
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = value;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { petId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dynamodb.send(command);
    return (response.Attributes as Pet) || null;
  }

  async deletePet(petId: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { petId },
    });

    await dynamodb.send(command);
    return true;
  }
}

export const dynamoDBService = new DynamoDBService();
