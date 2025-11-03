import { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '@/lib/swagger';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
