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
  // Separate stores for each table
  const petStore = new Map<string, any>();
  const ownerStore = new Map<string, any>();
  const appointmentStore = new Map<string, any>();

  const getStore = (tableName: string) => {
    if (tableName?.includes('Owner')) return ownerStore;
    if (tableName?.includes('Appointment')) return appointmentStore;
    return petStore;
  };

  const getKeyField = (tableName: string) => {
    if (tableName?.includes('Owner')) return 'ownerId';
    if (tableName?.includes('Appointment')) return 'appointmentId';
    return 'petId';
  };

  dynamodb = {
    send: async (command: any) => {
      const name = command.constructor && command.constructor.name;
      const input = command.input || {};
      const tableName = input.TableName || '';
      const store = getStore(tableName);
      const keyField = getKeyField(tableName);

      if (name === 'PutCommand') {
        const item = input.Item;
        const id = item?.[keyField];
        if (!item || !id) throw new Error('Invalid item');
        store.set(id, item);
        return {};
      }

      if (name === 'GetCommand') {
        const key = input.Key;
        const id = key?.[keyField];
        const item = id ? store.get(id) : undefined;
        return { Item: item };
      }

      if (name === 'ScanCommand') {
        const items = Array.from(store.values());
        return { Items: items };
      }

      if (name === 'UpdateCommand') {
        const key = input.Key;
        const id = key?.[keyField];
        const existing = store.get(id);
        if (!existing) return { Attributes: undefined };

        const values = input.ExpressionAttributeValues || {};
        const names = input.ExpressionAttributeNames || {};

        // Apply updates: map :vX tokens to real attribute names via #fX names mapping
        for (const [valKey, val] of Object.entries(values)) {
          // valKey is like ":v1", ":v2", etc.
          // Find corresponding #fX in UpdateExpression to get the attribute name
          const valToken = valKey; // e.g., ":v1"
          
          // Find the #fX token that corresponds to this :vX
          // by parsing ExpressionAttributeNames to find which #fX maps to which field name
          for (const [nameKey, realName] of Object.entries(names)) {
            // Check if this nameKey is used with our valToken in the expression
            // This is a simplified approach: we assume the order matches
            const valIndex = valKey.replace(':v', '');
            const nameIndex = nameKey.replace('#f', '');
            if (valIndex === nameIndex) {
              existing[realName as string] = val;
              break;
            }
          }
        }

        existing.updatedAt = new Date().toISOString();
        store.set(id, existing);
        return { Attributes: existing };
      }

      if (name === 'DeleteCommand') {
        const key = input.Key;
        const id = key?.[keyField];
        store.delete(id);
        return {};
      }

      throw new Error(`MockDynamoDB: unsupported command ${name}`);
    },
  };
} else {
  dynamodb = DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Pet";
const OWNER_TABLE_NAME = process.env.DYNAMODB_OWNER_TABLE_NAME || "Owner";
const APPOINTMENT_TABLE_NAME = process.env.DYNAMODB_APPOINTMENT_TABLE_NAME || "Appointment";

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
  email: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  appointmentId: string;
  petId: string;
  ownerId: string;
  dataHora: string; // ISO string
  status: 'pendente' | 'confirmado' | 'cancelado';
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
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

  // ========== OWNER METHODS ==========

  async createOwner(owner: Omit<Owner, "ownerId" | "createdAt" | "updatedAt">): Promise<Owner> {
    const now = new Date().toISOString();
    const newOwner: Owner = {
      ownerId: crypto.randomUUID(),
      ...owner,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: OWNER_TABLE_NAME,
      Item: newOwner,
    });

    await dynamodb.send(command);
    return newOwner;
  }

  async getAllOwners(): Promise<Owner[]> {
    const command = new ScanCommand({ TableName: OWNER_TABLE_NAME });
    const response = await dynamodb.send(command);
    return (response.Items as Owner[]) || [];
  }

  async getOwnerById(ownerId: string): Promise<Owner | null> {
    const command = new GetCommand({
      TableName: OWNER_TABLE_NAME,
      Key: { ownerId },
    });
    const response = await dynamodb.send(command);
    return (response.Item as Owner) || null;
  }

  async listOwners(opts: { page?: number; limit?: number; email?: string }) {
    const page = Number(opts.page || 1);
    const limit = Number(opts.limit || 10);
    const email = opts.email;

    const scanCmd = new ScanCommand({ TableName: OWNER_TABLE_NAME });
    const scanRes = await dynamodb.send(scanCmd);
    let items = (scanRes.Items || []) as Owner[];

    if (email) {
      const q = email.toLowerCase();
      items = items.filter(i => (i.email || '').toLowerCase().includes(q));
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total, page, limit };
  }

  async updateOwner(
    ownerId: string,
    updates: Partial<Omit<Owner, "ownerId" | "createdAt">>
  ): Promise<Owner | null> {
    const updateExpressionParts: string[] = [];
    const attributeValues: any = {};
    const attributeNames: any = {};
    let idx = 0;

    // Always update updatedAt
    idx++;
    updateExpressionParts.push(`#f${idx} = :v${idx}`);
    attributeNames[`#f${idx}`] = 'updatedAt';
    attributeValues[`:v${idx}`] = new Date().toISOString();

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updatedAt') continue;
      idx++;
      const nameToken = `#f${idx}`;
      const valToken = `:v${idx}`;
      updateExpressionParts.push(`${nameToken} = ${valToken}`);
      attributeNames[nameToken] = key;
      attributeValues[valToken] = value;
    }

    const command = new UpdateCommand({
      TableName: OWNER_TABLE_NAME,
      Key: { ownerId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
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

  // ========== APPOINTMENT METHODS ==========

  async createAppointment(
    appointment: Omit<Appointment, "appointmentId" | "createdAt" | "updatedAt">
  ): Promise<Appointment> {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      appointmentId: crypto.randomUUID(),
      ...appointment,
      status: appointment.status || 'pendente',
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Item: newAppointment,
    });

    await dynamodb.send(command);
    return newAppointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    const command = new ScanCommand({ TableName: APPOINTMENT_TABLE_NAME });
    const response = await dynamodb.send(command);
    return (response.Items as Appointment[]) || [];
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const command = new GetCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Key: { appointmentId },
    });
    const response = await dynamodb.send(command);
    return (response.Item as Appointment) || null;
  }

  async listAppointments(opts: { 
    page?: number; 
    limit?: number; 
    petId?: string;
    ownerId?: string;
    status?: 'pendente' | 'confirmado' | 'cancelado';
    dataInicio?: string;
    dataFim?: string;
  }) {
    const page = Number(opts.page || 1);
    const limit = Number(opts.limit || 10);

    const scanCmd = new ScanCommand({ TableName: APPOINTMENT_TABLE_NAME });
    const scanRes = await dynamodb.send(scanCmd);
    let items = (scanRes.Items || []) as Appointment[];

    // Filter by petId
    if (opts.petId) {
      items = items.filter(i => i.petId === opts.petId);
    }

    // Filter by ownerId
    if (opts.ownerId) {
      items = items.filter(i => i.ownerId === opts.ownerId);
    }

    // Filter by status
    if (opts.status) {
      items = items.filter(i => i.status === opts.status);
    }

    // Filter by date range
    if (opts.dataInicio) {
      items = items.filter(i => new Date(i.dataHora) >= new Date(opts.dataInicio!));
    }
    if (opts.dataFim) {
      items = items.filter(i => new Date(i.dataHora) <= new Date(opts.dataFim!));
    }

    items.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total, page, limit };
  }

  async updateAppointment(
    appointmentId: string,
    updates: Partial<Omit<Appointment, "appointmentId" | "createdAt">>
  ): Promise<Appointment | null> {
    const updateExpressionParts: string[] = [];
    const attributeValues: any = {};
    const attributeNames: any = {};
    let idx = 0;

    // Always update updatedAt
    idx++;
    updateExpressionParts.push(`#f${idx} = :v${idx}`);
    attributeNames[`#f${idx}`] = 'updatedAt';
    attributeValues[`:v${idx}`] = new Date().toISOString();

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updatedAt') continue;
      idx++;
      const nameToken = `#f${idx}`;
      const valToken = `:v${idx}`;
      updateExpressionParts.push(`${nameToken} = ${valToken}`);
      attributeNames[nameToken] = key;
      attributeValues[valToken] = value;
    }

    const command = new UpdateCommand({
      TableName: APPOINTMENT_TABLE_NAME,
      Key: { appointmentId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
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

  async confirmAppointment(appointmentId: string): Promise<Appointment | null> {
    return this.updateAppointment(appointmentId, { status: 'confirmado' });
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment | null> {
    return this.updateAppointment(appointmentId, { status: 'cancelado' });
  }

  async checkAppointmentConflict(petId: string, dataHora: string, excludeId?: string): Promise<boolean> {
    const allAppointments = await this.getAllAppointments();
    
    // Check if there's any appointment for the same pet at the same time (within 1 hour)
    const targetTime = new Date(dataHora).getTime();
    const oneHour = 60 * 60 * 1000;

    for (const apt of allAppointments) {
      if (apt.status === 'cancelado') continue;
      if (excludeId && apt.appointmentId === excludeId) continue;
      if (apt.petId !== petId) continue;

      const aptTime = new Date(apt.dataHora).getTime();
      if (Math.abs(targetTime - aptTime) < oneHour) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  // ========== RELATIONSHIP METHODS ==========

  async getAppointmentsByPetId(petId: string): Promise<Appointment[]> {
    const all = await this.getAllAppointments();
    return all.filter(a => a.petId === petId);
  }

  async getAppointmentsByOwnerId(ownerId: string): Promise<Appointment[]> {
    const all = await this.getAllAppointments();
    return all.filter(a => a.ownerId === ownerId);
  }

  async getPetsByOwnerId(ownerId: string): Promise<Pet[]> {
    const all = await this.getAllPets();
    return all.filter(p => p.ownerId === ownerId);
  }

  async canDeletePet(petId: string): Promise<{ canDelete: boolean; reason?: string }> {
    const appointments = await this.getAppointmentsByPetId(petId);
    const activeAppointments = appointments.filter(a => a.status !== 'cancelado');
    
    if (activeAppointments.length > 0) {
      return { 
        canDelete: false, 
        reason: `Pet has ${activeAppointments.length} active appointment(s)` 
      };
    }
    
    return { canDelete: true };
  }

  async canDeleteOwner(ownerId: string): Promise<{ canDelete: boolean; reason?: string }> {
    const pets = await this.getPetsByOwnerId(ownerId);
    
    if (pets.length > 0) {
      return { 
        canDelete: false, 
        reason: `Owner has ${pets.length} pet(s) registered` 
      };
    }

    const appointments = await this.getAppointmentsByOwnerId(ownerId);
    const activeAppointments = appointments.filter(a => a.status !== 'cancelado');
    
    if (activeAppointments.length > 0) {
      return { 
        canDelete: false, 
        reason: `Owner has ${activeAppointments.length} active appointment(s)` 
      };
    }
    
    return { canDelete: true };
  }
}

export const dynamoDBService = new DynamoDBService();
