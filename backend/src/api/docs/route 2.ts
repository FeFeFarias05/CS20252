import { Request, Response } from 'express';
import { swaggerSpec } from '../../lib/swagger';

export async function GET(req: Request, res: Response) {
  return res.json(swaggerSpec);
}
