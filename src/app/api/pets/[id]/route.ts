import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/pets/[id]
 * Retorna um pet específico (requer autenticação)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pet = await dynamoDBService.getPetById(params.id);

    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pet' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pets/[id]
 * Atualiza um pet (requer autenticação)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await req.json();

    // Verificar se o pet existe
    const existingPet = await dynamoDBService.getPetById(params.id);
    if (!existingPet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    // Se está atualizando o ownerId, verificar se o novo owner existe
    if (updates.ownerId && updates.ownerId !== existingPet.ownerId) {
      const owner = await dynamoDBService.getOwnerById(updates.ownerId);
      if (!owner) {
        return NextResponse.json(
          { error: 'New owner not found' },
          { status: 404 }
        );
      }
    }

    const updatedPet = await dynamoDBService.updatePet(params.id, updates);

    if (!updatedPet) {
      return NextResponse.json(
        { error: 'Failed to update pet' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pets/[id]
 * Remove um pet (requer autenticação)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verificar se o pet existe
    const pet = await dynamoDBService.getPetById(params.id);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    // Verificar se o pet tem appointments
    const appointments = await dynamoDBService.getAppointmentsByPetId(params.id);
    if (appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete pet with appointments. Delete appointments first.' },
        { status: 409 }
      );
    }

    await dynamoDBService.deletePet(params.id);

    return NextResponse.json(
      { message: 'Pet deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
}
