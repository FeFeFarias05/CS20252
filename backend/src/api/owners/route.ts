import { Request, Response } from 'express';
import { dynamoDBService } from '../../lib/dynamodb';
import { requireAdmin, requireSelfOrAdmin } from '../../lib/auth/rbac';

export async function GET(req: Request, res: Response) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const email = req.query.email as string || undefined;

    const result = await dynamoDBService.listOwners({ 
      page: Number(page), 
      limit: Number(limit), 
      email 
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Error listing owners:', error);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function POST(req: Request, res: Response) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof Response) return authCheck;

  try {
    const { nome, email, telefone, cpf, endereco } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({ error: 'nome and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'invalid email format' });
    }

    const owner = await dynamoDBService.createOwner({ 
      nome, 
      email,
      telefone,
      cpf,
      endereco
    });
    
    return res.status(201).json(owner);
  } catch (err) {
    console.error('Error creating owner:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
