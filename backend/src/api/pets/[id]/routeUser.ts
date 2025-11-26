import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';


export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pet = await dynamoDBService.getPetById(params.id);
    return pet
      ? NextResponse.json(pet)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = await req.json();

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (foto !== undefined) updateData.foto = foto;
    if (idade !== undefined) updateData.idade = idade;
    if (raca !== undefined) updateData.raca = raca;
    if (peso !== undefined) updateData.peso = peso;
    if (medicacoes !== undefined) updateData.medicacoes = medicacoes;
    if (informacoes !== undefined) updateData.informacoes = informacoes;

    const pet = await dynamoDBService.updatePet(params.id, updateData);
    return pet
      ? NextResponse.json(pet)
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}


export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await dynamoDBService.deletePet(params.id);
    return success
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}