import { Request, Response } from 'express';
import { dynamoDBService } from '../../../../lib/dynamodb';

export async function GET(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    const appointments = await dynamoDBService.getAppointmentsByOwnerId(id);
    return res.json({ appointments });
  } catch (err) {
    console.error('Error getting owner appointments:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
