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
        if (!item || !item.clientId) throw new Error('Invalid item');
        store.set(item.clientId, item);
        return {};
      }

      if (name === 'GetCommand') {
        const key = input.Key;
        const item = key && store.get(key.clientId);
        return { Item: item };
      }

      if (name === 'ScanCommand') {
        return { Items: Array.from(store.values()) };
      }

      if (name === 'UpdateCommand') {
        const key = input.Key;
        const clientId = key && key.clientId;
        const existing = store.get(clientId);
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

        store.set(clientId, existing);
        return { Attributes: existing };
      }

      if (name === 'DeleteCommand') {
        const key = input.Key;
        const clientId = key && key.clientId;
        store.delete(clientId);
        return {};
      }

      throw new Error(`MockDynamoDB: unsupported command ${name}`);
    },
  };
} else {
  dynamodb = DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Client";
const OWNER_TABLE_NAME = "Owner";
const PET_TABLE_NAME = "Pet";
const APPOINTMENT_TABLE_NAME = "Appointment";

export interface Client {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Owner {
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Pet {
  petId: string;
  ownerId: string;
  name: string;
  species: string; // cachorro, gato, etc
  breed?: string;
  birthDate?: string;
  weight?: number;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  appointmentId: string;
  petId: string;
  ownerId: string;
  date: string;
  time: string;
  type: string; // consulta, vacina, banho, tosa, etc
  status: string; // agendado, confirmado, cancelado, concluído
  veterinarian?: string;
  notes?: string;
  createdAt: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class DynamoDBService {
  async getAllClients(pagination?: PaginationParams): Promise<PaginatedResponse<Client>> {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await dynamodb.send(command);
    const allItems = (response.Items as Client[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async createClient(
    client: Omit<Client, "clientId" | "createdAt">
  ): Promise<Client> {
    const newClient: Client = {
      clientId: crypto.randomUUID(),
      ...client,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newClient,
    });

    await dynamodb.send(command);
    return newClient;
  }

  async getClientById(clientId: string): Promise<Client | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { clientId },
    });

    const response = await dynamodb.send(command);
    return (response.Item as Client) || null;
  }

  async updateClient(
    clientId: string,
    updates: Partial<Omit<Client, "clientId" | "createdAt">>
  ): Promise<Client | null> {
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
      Key: { clientId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dynamodb.send(command);
    return (response.Attributes as Client) || null;
  }

  async deleteClient(clientId: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { clientId },
    });

    await dynamodb.send(command);
    return true;
  }

  // ========== OWNER METHODS ==========
  async getAllOwners(pagination?: PaginationParams): Promise<PaginatedResponse<Owner>> {
    const command = new ScanCommand({ TableName: OWNER_TABLE_NAME });
    const response = await dynamodb.send(command);
    const allItems = (response.Items as Owner[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async createOwner(owner: Omit<Owner, "ownerId" | "createdAt">): Promise<Owner> {
    const newOwner: Owner = {
      ownerId: crypto.randomUUID(),
      ...owner,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: OWNER_TABLE_NAME,
      Item: newOwner,
    });

    await dynamodb.send(command);
    return newOwner;
  }

  async getOwnerById(ownerId: string): Promise<Owner | null> {
    const command = new GetCommand({
      TableName: OWNER_TABLE_NAME,
      Key: { ownerId },
    });

    const response = await dynamodb.send(command);
    return (response.Item as Owner) || null;
  }

  async updateOwner(
    ownerId: string,
    updates: Partial<Omit<Owner, "ownerId" | "createdAt">>
  ): Promise<Owner | null> {
    const updateExpression = [];
    const attributeValues: any = {};
    const attributeNames: any = {};

    for (const [key, value] of Object.entries(updates)) {
      updateExpression.push(`#${key} = :${key}`);
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = value;
    }

    const command = new UpdateCommand({
      TableName: OWNER_TABLE_NAME,
      Key: { ownerId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dynamodb.send(command);
    return (response.Attributes as Owner) || null;
  }

  async deleteOwner(ownerId: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: OWNER_TABLE_NAME,
      Key: { ownerId },
    });

    await dynamodb.send(command);
    return true;
  }

  // ========== PET METHODS ==========
  async getAllPets(pagination?: PaginationParams): Promise<PaginatedResponse<Pet>> {
    const command = new ScanCommand({ TableName: PET_TABLE_NAME });
    const response = await dynamodb.send(command);
    const allItems = (response.Items as Pet[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async getPetsByOwnerId(ownerId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Pet>> {
    const command = new ScanCommand({
      TableName: PET_TABLE_NAME,
      FilterExpression: "ownerId = :ownerId",
      ExpressionAttributeValues: { ":ownerId": ownerId },
    });

    const response = await dynamodb.send(command);
    const allItems = (response.Items as Pet[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async createPet(pet: Omit<Pet, "petId" | "createdAt">): Promise<Pet> {
    const newPet: Pet = {
      petId: crypto.randomUUID(),
      ...pet,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: PET_TABLE_NAME,
      Item: newPet,
    });

    await dynamodb.send(command);
    return newPet;
  }

  async getPetById(petId: string): Promise<Pet | null> {
    const command = new GetCommand({
      TableName: PET_TABLE_NAME,
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
      TableName: PET_TABLE_NAME,
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
      TableName: PET_TABLE_NAME,
      Key: { petId },
    });

    await dynamodb.send(command);
    return true;
  }

  // ========== APPOINTMENT METHODS ==========
  async getAllAppointments(pagination?: PaginationParams): Promise<PaginatedResponse<Appointment>> {
    const command = new ScanCommand({ TableName: APPOINTMENT_TABLE_NAME });
    const response = await dynamodb.send(command);
    const allItems = (response.Items as Appointment[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async getAppointmentsByPetId(petId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Appointment>> {
    const command = new ScanCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      FilterExpression: "petId = :petId",
      ExpressionAttributeValues: { ":petId": petId },
    });

    const response = await dynamodb.send(command);
    const allItems = (response.Items as Appointment[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async getAppointmentsByOwnerId(ownerId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Appointment>> {
    const command = new ScanCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      FilterExpression: "ownerId = :ownerId",
      ExpressionAttributeValues: { ":ownerId": ownerId },
    });

    const response = await dynamodb.send(command);
    const allItems = (response.Items as Appointment[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async getAppointmentsByDate(date: string, pagination?: PaginationParams): Promise<PaginatedResponse<Appointment>> {
    const command = new ScanCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      FilterExpression: "#d = :date",
      ExpressionAttributeNames: { "#d": "date" },
      ExpressionAttributeValues: { ":date": date },
    });

    const response = await dynamodb.send(command);
    const allItems = (response.Items as Appointment[]) || [];
    
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      total: allItems.length,
      limit,
      offset,
      hasMore: offset + limit < allItems.length
    };
  }

  async createAppointment(
    appointment: Omit<Appointment, "appointmentId" | "createdAt">
  ): Promise<Appointment> {
    const newAppointment: Appointment = {
      appointmentId: crypto.randomUUID(),
      ...appointment,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Item: newAppointment,
    });

    await dynamodb.send(command);
    return newAppointment;
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const command = new GetCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Key: { appointmentId },
    });

    const response = await dynamodb.send(command);
    return (response.Item as Appointment) || null;
  }

  async updateAppointment(
    appointmentId: string,
    updates: Partial<Omit<Appointment, "appointmentId" | "createdAt">>
  ): Promise<Appointment | null> {
    const updateExpression = [];
    const attributeValues: any = {};
    const attributeNames: any = {};

    for (const [key, value] of Object.entries(updates)) {
      updateExpression.push(`#${key} = :${key}`);
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = value;
    }

    const command = new UpdateCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Key: { appointmentId },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dynamodb.send(command);
    return (response.Attributes as Appointment) || null;
  }

  async deleteAppointment(appointmentId: string): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Key: { appointmentId },
    });

    await dynamodb.send(command);
    return true;
  }
}

export const dynamoDBService = new DynamoDBService();
