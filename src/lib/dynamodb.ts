import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  PutCommand, 
  GetCommand, 
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Client";

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class DynamoDBService {
  async getAllClients(): Promise<Client[]> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });
      
      const response = await dynamodb.send(command);
      return response.Items as Client[] || [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }


  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    try {
      const newClient: Client = {
        id: crypto.randomUUID(),
        ...client,
        createdAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: newClient,
      });

      await dynamodb.send(command);
      return newClient;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      });

      const response = await dynamodb.send(command);
      return response.Item as Client || null;
    } catch (error) {
      console.error("Error fetching client by ID:", error);
      throw error;
    }
  }

  async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client | null> {
    try {
      const updateExpression = [];
      const expressionAttributeValues: any = {};
      const expressionAttributeNames: any = {};

      for (const [key, value] of Object.entries(updates)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }

      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      });

      const response = await dynamodb.send(command);
      return response.Attributes as Client || null;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      });

      await dynamodb.send(command);
      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }
}

export const dynamoDBService = new DynamoDBService();
