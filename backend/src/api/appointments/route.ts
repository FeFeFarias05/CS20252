import { Request, Response } from 'express';
import { dynamoDBService } from '../../lib/dynamodb';
import { requireOperator, getAuthInfo, isAdmin } from '../../lib/auth/rbac';

export async function GET(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const petId = req.query.petId as string || undefined;
    const ownerId = req.query.ownerId as string || undefined;
    const status = req.query.status as 'pendente' | 'confirmado' | 'cancelado' || undefined;
    const dataInicio = req.query.dataInicio as string || undefined;
    const dataFim = req.query.dataFim as string || undefined;

    const result = await dynamoDBService.listAppointments({ 
      page: Number(page), 
      limit: Number(limit),
      petId,
      ownerId,
      status,
      dataInicio,
      dataFim
    });
    
    if (!isAdmin(auth) && auth?.sub) {
      result.items = result.items.filter(apt => apt.ownerId === auth.sub);
      result.total = result.items.length;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error listing appointments:', error);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function POST(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { petId, ownerId, dataHora, observacoes } = req.body;
    
    if (!petId || !ownerId || !dataHora) {
      return res.status(400).json({ error: 'petId, ownerId, and dataHora are required' });
    }

    const appointmentDate = new Date(dataHora);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ error: 'appointment date must be in the future' });
    }

    
    const pet = await dynamoDBService.getPetById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'pet not found' });
    }

    if (!isAdmin(auth) && pet.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only create appointments for your own pets' });
    }

    const owner = await dynamoDBService.getOwnerById(ownerId);
    if (!owner) {
      return res.status(404).json({ error: 'owner not found' });
    }

    const hasConflict = await dynamoDBService.checkAppointmentConflict(petId, dataHora);
    if (hasConflict) {
      return res.status(409).json({ error: 'appointment conflict - pet already has an appointment at this time' });
    }

    const appointment = await dynamoDBService.createAppointment({ 
      petId,
      ownerId,
      dataHora,
      status: 'pendente',
      observacoes
    });
    
    return res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
