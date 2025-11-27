import { Request, Response } from 'express';
import { dynamoDBService } from '../../lib/dynamodb';
import { requireOperator, getAuthInfo, isAdmin } from '../../lib/auth/rbac';


export async function GET(req: Request, res: Response) {
  try {
    const auth = await getAuthInfo(req);
    
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const ageGroup = req.query.ageGroup as string || undefined;
    const name = req.query.name as string || undefined;

    const result = await dynamoDBService.listPets({ page: Number(page), limit: Number(limit), ageGroup, name });
    
    // Filter by ownerId if not admin
    if (!isAdmin(auth) && auth?.sub) {
      result.items = result.items.filter(pet => pet.ownerId === auth.sub);
      result.total = result.items.length;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error listing pets:', error);
    return res.status(500).json({ error: 'internal' });
  }
}


export async function POST(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck) return authCheck;

  try {
    const auth = await getAuthInfo(req);
    const { nome, foto, idade, raca, peso, medicacoes, informacoes, ownerId } = req.body;
    
    if (!nome || idade === undefined || !raca || peso === undefined) {
      return res.status(400).json({ error: 'nome, idade, raca, and peso are required' });
    }

    // Non-admin users can only create pets for themselves
    let finalOwnerId = ownerId;
    if (!isAdmin(auth)) {
      finalOwnerId = auth?.sub || null;
    }

    const pet = await dynamoDBService.createPet({ 
      nome, 
      foto: foto || '', 
      idade, 
      raca, 
      peso, 
      medicacoes: medicacoes || '', 
      informacoes: informacoes || '',
      ownerId: finalOwnerId
    });
    return res.status(201).json(pet);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function PUT(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck) return authCheck;

  try {
    const { id } = req.params;
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    const updatedPet = await dynamoDBService.updatePet(id, {
      nome,
      foto,
      idade,
      raca,
      peso,
      medicacoes,
      informacoes
    });

    if (!updatedPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    return res.json(updatedPet);
  } catch (err) {
    console.error('Error updating pet:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function DELETE(req: Request, res: Response) {
  const authCheck = await requireOperator(req);
  if (authCheck) return authCheck;

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    // Check if pet can be deleted
    const validationResult = await dynamoDBService.canDeletePet(id);
    if (!validationResult.canDelete) {
      return res.status(409).json({ error: validationResult.reason });
    }

    await dynamoDBService.deletePet(id);
    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting pet:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
