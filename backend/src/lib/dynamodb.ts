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
        const items = Array.from(store.values());
        return { Items: items };
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

        existing.updatedAt = new Date().toISOString();
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
  ownerId: string | null;
  createdAt: string;
}

export interface Owner {
  ownerId: string;
  nome: string;
  email?: string;
  telefone?: string;
  createdAt: string;
}

export interface Appointment {
  appointmentId: string;
  petId: string;
  ownerId?: string | null;
  dataHora: string; // ISO string
  createdAt: string;
}

function ageRangeToFilter(ageGroup?: string) {
  if (!ageGroup) return null;
  if (ageGroup === '15+') return { min: 15, max: 30 };
  const parts = ageGroup.split('-').map((v) => Number(v));
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  return null;
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
    const now = new Date().toISOString();
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

  async getPetById(idOrName: string): Promise<Pet | null> {
    const getCmd = new GetCommand({
      TableName: TABLE_NAME,
      Key: { petId: idOrName },
    });
    const res = await dynamodb.send(getCmd);
    if (res.Item) return (res.Item as Pet) || null;

    const scanCmd = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const scanRes = await dynamodb.send(scanCmd);
    const items = (scanRes.Items || []) as Pet[];
    const found = items.find(i => (i.nome || '').toLowerCase() === idOrName.toLowerCase());
    return (found as Pet) || null;
  }

  async listPets(opts: { page?: number; limit?: number; ageGroup?: string; name?: string }) {
    const page = Number(opts.page || 1);
    const limit = Number(opts.limit || 10);
    const name = opts.name;
    const ageFilter = ageRangeToFilter(opts.ageGroup);

    const scanCmd = new ScanCommand({ TableName: TABLE_NAME });
    const scanRes = await dynamodb.send(scanCmd);
    let items = (scanRes.Items || []) as Pet[];

    if (name) {
      const q = name.toLowerCase();
      items = items.filter(i => (i.nome || '').toLowerCase().includes(q));
    }

    if (ageFilter) {
      items = items.filter(i => {
        const age = Number(i.idade) || 0;
        return age >= ageFilter.min && age <= ageFilter.max;
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total, page, limit };
  }

  async updatePet(
    petId: string,
    updates: Partial<Omit<Pet, "petId" | "createdAt">>
  ): Promise<Pet | null> {
    const updateExpressionParts: string[] = [];
    const attributeValues: any = {};
    const attributeNames: any = {};
    let idx = 0;

    for (const [key, value] of Object.entries(updates)) {
      idx++;
      const nameToken = `#f${idx}`;
      const valToken = `:v${idx}`;
      updateExpressionParts.push(`${nameToken} = ${valToken}`);
      attributeNames[nameToken] = key;
      attributeValues[valToken] = value;
    }

    if (updateExpressionParts.length === 0) {
      const getCmd = new GetCommand({ TableName: TABLE_NAME, Key: { petId } });
      const getRes = await dynamodb.send(getCmd);
      return (getRes.Item as Pet) || null;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { petId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
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
