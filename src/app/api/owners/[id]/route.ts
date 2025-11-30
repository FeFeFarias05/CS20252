import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/owners/[id]
 * Retorna um dono específico (requer autenticação)
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
    const owner = await dynamoDBService.getOwnerById(params.id);

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error('Error fetching owner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/owners/[id]
 * Atualiza um dono (requer autenticação)
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

    // Verificar se o owner existe
    const existingOwner = await dynamoDBService.getOwnerById(params.id);
    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    // Se está atualizando o email, verificar unicidade
    if (updates.email && updates.email !== existingOwner.email) {
      const allOwners = await dynamoDBService.getAllOwners();
      const emailExists = allOwners.some(
        owner => owner.email === updates.email && owner.ownerId !== params.id
      );

      if (emailExists) {
        return NextResponse.json(
          { error: 'email must be unique' },
          { status: 409 }
        );
      }
    }

    const updatedOwner = await dynamoDBService.updateOwner(params.id, updates);

    if (!updatedOwner) {
      return NextResponse.json(
        { error: 'Failed to update owner' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedOwner);
  } catch (error) {
    console.error('Error updating owner:', error);
    return NextResponse.json(
      { error: 'Failed to update owner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/owners/[id]
 * Remove um dono (requer autenticação)
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
    // Verificar se o owner existe
    const owner = await dynamoDBService.getOwnerById(params.id);
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    // Verificar se o owner tem pets
    const pets = await dynamoDBService.getPetsByOwnerId(params.id);
    if (pets.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete owner with pets. Delete pets first.' },
        { status: 409 }
      );
    }

    await dynamoDBService.deleteOwner(params.id);

    return NextResponse.json(
      { message: 'Owner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting owner:', error);
    return NextResponse.json(
      { error: 'Failed to delete owner' },
      { status: 500 }
    );
  }
}
