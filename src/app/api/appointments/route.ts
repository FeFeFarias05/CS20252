import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/appointments
 * Lista todos os compromissos (requer autenticação)
 * Query params: 
 *   - ?petId=xxx para filtrar por pet
 *   - ?ownerId=xxx para filtrar por dono
 *   - ?date=YYYY-MM-DD para filtrar por data
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
    const petId = searchParams.get('petId');
    const ownerId = searchParams.get('ownerId');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;
    
    if (petId) {
      result = await dynamoDBService.getAppointmentsByPetId(petId, { limit, offset });
    } else if (ownerId) {
      result = await dynamoDBService.getAppointmentsByOwnerId(ownerId, { limit, offset });
    } else if (date) {
      result = await dynamoDBService.getAppointmentsByDate(date, { limit, offset });
    } else {
      result = await dynamoDBService.getAllAppointments({ limit, offset });
    }

    const sortedItems = result.items.sort(
      (a, b) => {
        // Ordenar por data e hora
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return dateTimeB - dateTimeA;
      }
    );

    return NextResponse.json({
      items: sortedItems,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Cria um novo compromisso (requer autenticação)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { petId, ownerId, date, time, type, status, veterinarian, notes } = await req.json();

    if (!petId || !ownerId || !date || !time || !type || !status) {
      return NextResponse.json(
        { error: 'petId, ownerId, date, time, type and status are required' },
        { status: 400 }
      );
    }

    // Verificar se o pet existe
    const pet = await dynamoDBService.getPetById(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    // Verificar se o owner existe e é o dono do pet
    const owner = await dynamoDBService.getOwnerById(ownerId);
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    if (pet.ownerId !== ownerId) {
      return NextResponse.json(
        { error: 'Pet does not belong to this owner' },
        { status: 400 }
      );
    }

    const newAppointment = await dynamoDBService.createAppointment({
      petId,
      ownerId,
      date,
      time,
      type,
      status,
      veterinarian,
      notes,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
