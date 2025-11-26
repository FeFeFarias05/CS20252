import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';


export async function GET() {
  try {
    const pets = await dynamoDBService.getAllPets();
    const sortedPets = pets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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


export async function POST(req: NextRequest) {
  try {
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = await req.json();
    
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
      informacoes: informacoes || '' 
    });
    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 },
    );
  }
}