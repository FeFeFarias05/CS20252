import express from 'express';
import dotenv from 'dotenv';
import petsRouter from './api/pets/routeUsers';
import ownersRouter from './api/owners/index';
import appointmentsRouter from './api/appointments/index';
import { GET as getSwagger } from './api/docs/route';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rotas v1
app.use('/api/v1/pets', petsRouter);
app.use('/api/v1/owners', ownersRouter);
app.use('/api/v1/appointments', appointmentsRouter);
app.get('/api/v1/docs', getSwagger);

// Backwards compatibility (deprecated)
app.use('/api/pets', petsRouter);
app.get('/api/docs', getSwagger);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pet Clinic API',
    version: 'v1',
    endpoints: {
      docs: '/api/v1/docs',
      health: '/health',
      pets: '/api/v1/pets',
      owners: '/api/v1/owners',
      appointments: '/api/v1/appointments'
    }
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend rodando na porta ${PORT}`);
  });
}

export default app;
