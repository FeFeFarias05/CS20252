import { Request, Response } from 'express';
import { dynamoDBService } from '../../../lib/dynamodb';
import { requireAdmin, requireSelfOrAdmin } from '../../../lib/auth/rbac';

export async function GET(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    const owner = await dynamoDBService.getOwnerById(id);
    
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    return res.json(owner);
  } catch (err) {
    console.error('Error getting owner:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function PUT(req: Request, res: Response) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, endereco } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'invalid email format' });
      }
    }

    const updatedOwner = await dynamoDBService.updateOwner(id, {
      nome,
      email,
      telefone,
      cpf,
      endereco
    });

    if (!updatedOwner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    return res.json(updatedOwner);
  } catch (err) {
    console.error('Error updating owner:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function DELETE(req: Request, res: Response) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    // Check if owner can be deleted
    const validationResult = await dynamoDBService.canDeleteOwner(id);
    if (!validationResult.canDelete) {
      return res.status(409).json({ error: validationResult.reason });
    }

    await dynamoDBService.deleteOwner(id);
    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting owner:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
