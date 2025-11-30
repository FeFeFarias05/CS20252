import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/pets
 * Lista todos os pets (requer autenticação)
 * Query params: 
 *   - ?ownerId=xxx para filtrar por dono
 *   - ?limit=10 para limitar resultados (padrão: 10)
 *   - ?offset=0 para paginação (padrão: 0)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;
    if (ownerId) {
      result = await dynamoDBService.getPetsByOwnerId(ownerId, { limit, offset });
    } else {
      result = await dynamoDBService.getAllPets({ limit, offset });
    }

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
    console.error('Error fetching pets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pets
 * Cria um novo pet (requer autenticação)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ownerId, name, species, breed, birthDate, weight, notes } = await req.json();

    if (!ownerId || !name || !species) {
      return NextResponse.json(
        { error: 'ownerId, name and species are required' },
        { status: 400 }
      );
    }

    // Verificar se o owner existe
    const owner = await dynamoDBService.getOwnerById(ownerId);
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    const newPet = await dynamoDBService.createPet({
      ownerId,
      name,
      species,
      breed,
      birthDate,
      weight,
      notes,
    });

    return NextResponse.json(newPet, { status: 201 });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    );
  }
}
