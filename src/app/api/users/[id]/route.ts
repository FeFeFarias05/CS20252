import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';

/**
 * GET `/api/users/[id]` – fetch a single user by id.
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await dynamoDBService.getClientById(params.id);
    return user
      ? NextResponse.json(user)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * PUT `/api/users/[id]` – update a user's name or email.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, email } = await req.json();
  try {
    // Check if email is being updated and if it's already taken by another user
    if (email) {
      const existingUsers = await dynamoDBService.getAllClients();
      const emailTaken = existingUsers.some(user => user.email === email && user.clientId !== params.id);
      
      if (emailTaken) {
        return NextResponse.json(
          { error: 'email must be unique' },
          { status: 409 }
        );
      }
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await dynamoDBService.updateClient(params.id, updates);
    return user
      ? NextResponse.json(user)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * DELETE `/api/users/[id]` – remove a user from the database.
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user exists first
    const user = await dynamoDBService.getClientById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const success = await dynamoDBService.deleteClient(params.id);
    return success
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'failed to delete' }, { status: 500 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * GET `/api/users/` – fetch all users.
 */
export async function GETAll() {
  try {
    const users = await dynamoDBService.getAllClients();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * POST `/api/users/` – create a new user.
 */
export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json(
      { error: 'name and email are required' },
      { status: 400 }
    );
  }

  try {
    // Check if email is already taken
    const existingUsers = await dynamoDBService.getAllClients();
    const emailTaken = existingUsers.some(user => user.email === email);
    
    if (emailTaken) {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 }
      );
    }

    const newUser = await dynamoDBService.createClient({ name, email });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error
    );
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
} 