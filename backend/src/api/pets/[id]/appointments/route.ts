import { Request, Response } from 'express';
import { dynamoDBService } from '../../../../lib/dynamodb';

export async function GET(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    const appointments = await dynamoDBService.getAppointmentsByPetId(id);
    return res.json({ appointments });
  } catch (err) {
    console.error('Error getting pet appointments:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
