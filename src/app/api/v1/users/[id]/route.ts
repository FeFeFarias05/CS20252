import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireSelfOrAdmin, requireAdmin } from '@/lib/auth/rbac';

/**
 * GET `/api/users/[id]` – fetch a single user by id.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await requireSelfOrAdmin(req, params.id);
  if (payload instanceof Response) return payload;

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
  const payload = await requireSelfOrAdmin(req, params.id);
  if (payload instanceof Response) return payload;

  const { name, email } = await req.json();
  try {
    if (email) {
      const existingUsers = await dynamoDBService.getAllClients();
      const emailTaken = existingUsers.items.some(
        user => user.email === email && user.clientId !== params.id
      );
      if (emailTaken) {
        return NextResponse.json({ error: 'email must be unique' }, { status: 409 });
      }
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updatedUser = await dynamoDBService.updateClient(params.id, updates);
    return updatedUser
      ? NextResponse.json(updatedUser)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * DELETE `/api/users/[id]` – remove a user from the database.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await requireAdmin(req);
  if (payload instanceof Response) return payload;

  try {
    const user = await dynamoDBService.getClientById(params.id);
    if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const success = await dynamoDBService.deleteClient(params.id);
    return success
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: 'failed to delete' }, { status: 500 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
