import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/pets
 * Lista todos os pets (requer autenticação)
 * Query params: ?ownerId=xxx para filtrar por dono
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

    let pets;
    if (ownerId) {
      pets = await dynamoDBService.getPetsByOwnerId(ownerId);
    } else {
      pets = await dynamoDBService.getAllPets();
    }

    const sortedPets = pets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedPets);
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
