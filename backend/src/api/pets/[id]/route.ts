import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireOperator } from '@/lib/auth/rbac';

/**
 * GET `/api/pets/[id]` – buscar um pet por id.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pet = await dynamoDBService.getPetById(params.id);
    return pet
      ? NextResponse.json(pet)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * PUT `/api/pets/[id]` – atualizar informações de um pet.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireOperator(req);
  if ((authCheck as any)?.status) return authCheck;

  try {
    const updates = await req.json() as any;
    const updated = await dynamoDBService.updatePet(params.id, updates);
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * DELETE `/api/pets/[id]` – remover um pet do banco de dados.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireOperator(req);
  if ((authCheck as any)?.status) return authCheck;

  try {
    const pet = await dynamoDBService.getPetById(params.id);
    if (!pet) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await dynamoDBService.deletePet(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
