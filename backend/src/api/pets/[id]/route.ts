import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';

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
  try {
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = await req.json();
    
    const updates: any = {};
    if (nome !== undefined) updates.nome = nome;
    if (foto !== undefined) updates.foto = foto;
    if (idade !== undefined) updates.idade = idade;
    if (raca !== undefined) updates.raca = raca;
    if (peso !== undefined) updates.peso = peso;
    if (medicacoes !== undefined) updates.medicacoes = medicacoes;
    if (informacoes !== undefined) updates.informacoes = informacoes;

    const updatedPet = await dynamoDBService.updatePet(params.id, updates);
    return updatedPet
      ? NextResponse.json(updatedPet)
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
  try {
    const pet = await dynamoDBService.getPetById(params.id);
    if (!pet) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const success = await dynamoDBService.deletePet(params.id);
    return success
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: 'failed to delete' }, { status: 500 });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
