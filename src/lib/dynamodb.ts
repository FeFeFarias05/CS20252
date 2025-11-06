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


const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Client";

export interface Client {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export class DynamoDBService {
  async getAllClients(): Promise<Client[]> {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await dynamodb.send(command);
    return (response.Items as Client[]) || [];
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
}

export const dynamoDBService = new DynamoDBService();
