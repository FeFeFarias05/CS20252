import { Request, Response } from 'express';
import { dynamoDBService } from '../../../lib/dynamodb';
import { requireOperator, getAuthInfo, isAdmin } from '../../../lib/auth/rbac';

export async function GET(req: Request, res: Response) {
  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    const pet = await dynamoDBService.getPetById(id);
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check ownership
    if (!isAdmin(auth) && pet.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only access your own pets' });
    }

    return res.json(pet);
  } catch (err) {
    console.error('Error getting pet:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function PUT(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    // Check ownership before update
    const pet = await dynamoDBService.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (!isAdmin(auth) && pet.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only update your own pets' });
    }

    const updated = await dynamoDBService.updatePet(id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating pet:', error);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function DELETE(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    // Check ownership before delete
    const pet = await dynamoDBService.getPetById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (!isAdmin(auth) && pet.ownerId !== auth?.sub) {
      return res.status(403).json({ error: 'Forbidden - you can only delete your own pets' });
    }

    // Check if pet can be deleted
    const validationResult = await dynamoDBService.canDeletePet(id);
    if (!validationResult.canDelete) {
      return res.status(409).json({ error: validationResult.reason });
    }

    await dynamoDBService.deletePet(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting pet:', error);
    return res.status(500).json({ error: 'internal' });
  }
}
