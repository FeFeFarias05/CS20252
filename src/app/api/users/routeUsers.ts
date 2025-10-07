import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';


export async function GET() {
  try {
    const clients = await dynamoDBService.getAllClients();
    const sortedClients = clients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 },
      );
    }

    const existingClients = await dynamoDBService.getAllClients();
    const emailExists = existingClients.some(client => client.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 },
      );
    }

    const client = await dynamoDBService.createClient({ name, email });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 },
    );
  }
}