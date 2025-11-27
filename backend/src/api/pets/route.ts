import { Request, Response } from 'express';
import { dynamoDBService } from '../../lib/dynamodb';

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Listar todos os pets
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: Lista de pets retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       500:
 *         description: Erro interno do servidor
 */
export async function GET(req: Request, res: Response) {
  try {
    const pets = await dynamoDBService.getAllPets();
    const sortedPets = pets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return res.json(sortedPets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
}

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Criar um novo pet
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - idade
 *               - raca
 *               - peso
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Rex
 *               foto:
 *                 type: string
 *                 example: https://example.com/rex.jpg
 *               idade:
 *                 type: number
 *                 example: 3
 *               raca:
 *                 type: string
 *                 example: Golden Retriever
 *               peso:
 *                 type: number
 *                 example: 25.5
 *               medicacoes:
 *                 type: string
 *                 example: Vacina antirrábica
 *               informacoes:
 *                 type: string
 *                 example: Pet muito dócil
 *     responses:
 *       201:
 *         description: Pet criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
export async function POST(req: Request, res: Response) {
  try {
    const { nome, foto, idade, raca, peso, medicacoes, informacoes } = req.body;
    
    if (!nome || idade === undefined || !raca || peso === undefined) {
      return res.status(400).json({ error: 'nome, idade, raca, and peso are required' });
    }

    const pet = await dynamoDBService.createPet({ 
      nome, 
      foto: foto || '', 
      idade, 
      raca, 
      peso, 
      medicacoes: medicacoes || '', 
      informacoes: informacoes || '' 
    });
    return res.status(201).json(pet);
  } catch (error) {
    console.error('Error creating pet:', error);
    return res.status(500).json({ error: 'Failed to create pet' });
  }
}
