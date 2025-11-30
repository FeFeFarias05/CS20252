import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/owners
 * Lista todos os donos de pets (requer autenticação)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await dynamoDBService.getAllOwners({ limit, offset });
    const sortedItems = result.items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({
      items: sortedItems,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/owners
 * Cria um novo dono de pet (requer autenticação)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, address } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'name, email and phone are required' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingOwnersResult = await dynamoDBService.getAllOwners();
    const emailExists = existingOwnersResult.items.some(owner => owner.email === email);

    if (emailExists) {
      return NextResponse.json(
        { error: 'email must be unique' },
        { status: 409 }
      );
    }

    const newOwner = await dynamoDBService.createOwner({
      name,
      email,
      phone,
      address,
    });

    return NextResponse.json(newOwner, { status: 201 });
  } catch (error) {
    console.error('Error creating owner:', error);
    return NextResponse.json(
      { error: 'Failed to create owner' },
      { status: 500 }
    );
  }
}
