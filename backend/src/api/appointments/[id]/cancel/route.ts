import { Request, Response } from 'express';
import { dynamoDBService } from '../../../../lib/dynamodb';
import { requireOperator, getAuthInfo, isAdmin } from '../../../../lib/auth/rbac';

export async function POST(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    const current = await dynamoDBService.getAppointmentById(id);
    if (!current) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!isAdmin(auth) && current.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only cancel your own appointments' });
    }

    if (current.status === 'cancelado') {
      return res.status(400).json({ error: 'appointment is already canceled' });
    }

    const canceled = await dynamoDBService.cancelAppointment(id);
    return res.json(canceled);
  } catch (err) {
    console.error('Error canceling appointment:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
