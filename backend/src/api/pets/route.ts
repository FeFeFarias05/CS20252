import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireOperator } from '@/lib/auth/rbac';

/**
 * GET /api/pets - Listar todos os pets
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const ageGroup = url.searchParams.get('ageGroup') || undefined;
    const name = url.searchParams.get('name') || undefined;

    const result = await dynamoDBService.listPets({ page: Number(page), limit: Number(limit), ageGroup, name });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing pets:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * POST /api/pets - Criar um novo pet
 */
export async function POST(req: NextRequest) {
  const authCheck = await requireOperator(req);
  if ((authCheck as any)?.status) return authCheck;

  try {
    const body = await req.json() as any;
    const { nome, foto, idade, raca, peso, medicacoes, informacoes, ownerId } = body;
    if (!nome || idade === undefined || !raca || peso === undefined) {
      return NextResponse.json(
        { error: 'nome, idade, raca, and peso are required' },
        { status: 400 },
      );
    }
    const pet = await dynamoDBService.createPet({ 
      nome, 
      foto: foto || '', 
      idade, 
      raca, 
      peso, 
      medicacoes: medicacoes || '', 
      informacoes: informacoes || '',
      ownerId
    });
    return NextResponse.json(pet, { status: 201 });
  } catch (err) {
    console.error('Error creating pet:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
