import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';


export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await dynamoDBService.getClientById(params.id);
    return client
      ? NextResponse.json(client)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email } = await req.json();
    
    if (email) {
      const existingClients = await dynamoDBService.getAllClients();
      const emailExists = existingClients.items.some(client => 
        client.email === email && client.clientId !== params.id
      );
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'email must be unique' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const client = await dynamoDBService.updateClient(params.id, updateData);
    return client
      ? NextResponse.json(client)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}


export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await dynamoDBService.deleteClient(params.id);
    return success
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}