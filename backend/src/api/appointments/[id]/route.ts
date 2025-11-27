import { Request, Response } from 'express';
import { dynamoDBService } from '../../../lib/dynamodb';
import { requireOperator, getAuthInfo, isAdmin } from '../../../lib/auth/rbac';

export async function GET(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    const appointment = await dynamoDBService.getAppointmentById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!isAdmin(auth) && appointment.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only access your own appointments' });
    }

    return res.json(appointment);
  } catch (err) {
    console.error('Error getting appointment:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function PUT(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    const { dataHora, observacoes, status } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    const current = await dynamoDBService.getAppointmentById(id);
    if (!current) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (!isAdmin(auth) && current.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only update your own appointments' });
    }

    if (status) {
      if (!['pendente', 'confirmado', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'invalid status' });
      }

      if (current.status === 'cancelado' && status !== 'cancelado') {
        return res.status(400).json({ error: 'cannot modify canceled appointment' });
      }
    }

    if (dataHora) {
      const newDate = new Date(dataHora);
      if (newDate <= new Date()) {
        return res.status(400).json({ error: 'appointment date must be in the future' });
      }

      const hasConflict = await dynamoDBService.checkAppointmentConflict(
        current.petId, 
        dataHora, 
        id
      );
      if (hasConflict) {
        return res.status(409).json({ error: 'appointment conflict' });
      }
    }

    const updatedAppointment = await dynamoDBService.updateAppointment(id, {
      dataHora,
      observacoes,
      status
    });

    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function DELETE(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    await dynamoDBService.deleteAppointment(id);
    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting appointment:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
