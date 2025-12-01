import { NextRequest, NextResponse } from 'next/server';
import { dynamoDBService } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth/withAuth';

/**
 * GET /api/appointments/[id]
 * Retorna um compromisso específico (requer autenticação)
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
    const appointment = await dynamoDBService.getAppointmentById(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appointments/[id]
 * Atualiza um compromisso (requer autenticação)
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

    // Verificar se o appointment existe
    const existingAppointment = await dynamoDBService.getAppointmentById(params.id);
    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Se está atualizando o petId, verificar se o novo pet existe
    if (updates.petId && updates.petId !== existingAppointment.petId) {
      const pet = await dynamoDBService.getPetById(updates.petId);
      if (!pet) {
        return NextResponse.json(
          { error: 'New pet not found' },
          { status: 404 }
        );
      }

      // Atualizar também o ownerId se o pet mudou
      if (!updates.ownerId) {
        updates.ownerId = pet.ownerId;
      }
    }

    // Se está atualizando o ownerId, verificar se o owner existe
    if (updates.ownerId && updates.ownerId !== existingAppointment.ownerId) {
      const owner = await dynamoDBService.getOwnerById(updates.ownerId);
      if (!owner) {
        return NextResponse.json(
          { error: 'New owner not found' },
          { status: 404 }
        );
      }
    }

    const updatedAppointment = await dynamoDBService.updateAppointment(params.id, updates);

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Remove um compromisso (requer autenticação)
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
    // Verificar se o appointment existe
    const appointment = await dynamoDBService.getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    await dynamoDBService.deleteAppointment(params.id);

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
