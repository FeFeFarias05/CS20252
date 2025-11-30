import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/auth/rbac';

/**
 * GET /api/users → somente admin
 */
export async function GET(req: NextRequest) {
  const payload = await requireAdmin(req);
  if (payload instanceof Response) return payload;

  try {
    const response = await dynamoDBService.getAllClients();
    const sortedUsers = response.items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users → somente admin
 * Cria um novo usuário. `name` e `email` são obrigatórios e email deve ser único.
 */
export async function POST(req: NextRequest) {
  const payload = await requireAdmin(req);
  if (payload instanceof Response) return payload;

  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json(
      { error: 'name/email required' },
      { status: 400 },
    );
  }

  try {
    const existingUsers = await dynamoDBService.getAllClients();
    const emailExists = existingUsers.items.some(user => user.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 },
      );
    }

    const user = await dynamoDBService.createClient({ name, email });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'internal' },
      { status: 500 },
    );
  }
}
