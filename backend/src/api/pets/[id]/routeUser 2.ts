import { Request, Response } from 'express';
import { dynamoDBService } from '../../../lib/dynamodb';


export async function GET(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const pet = await dynamoDBService.getPetById(id);
    
    if (!pet) {
      return res.status(404).json({ error: 'not found' });
    }
    
    return res.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
}


export async function PUT(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = req.body;

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (foto !== undefined) updateData.foto = foto;
    if (idade !== undefined) updateData.idade = idade;
    if (raca !== undefined) updateData.raca = raca;
    if (peso !== undefined) updateData.peso = peso;
    if (medicacoes !== undefined) updateData.medicacoes = medicacoes;
    if (informacoes !== undefined) updateData.informacoes = informacoes;

    const pet = await dynamoDBService.updatePet(id, updateData);
    
    if (!pet) {
      return res.status(404).json({ error: 'not found' });
    }
    
    return res.json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
}


export async function DELETE(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await dynamoDBService.deletePet(id);
    
    if (!success) {
      return res.status(404).json({ error: 'not found' });
    }
    
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
}