import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CS20252 API - Pet Management',
      version: '1.0.0',
      description: 'API para gerenciamento de pets com autenticação JWT',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
      { url: 'https://api.cs20252.com', description: 'Production' }
    ],
    components: {
      schemas: {
        Pet: {
          type: 'object',
          required: ['petId', 'nome', 'idade', 'raca', 'peso', 'createdAt'],
          properties: {
            petId: {
              type: 'string',
              description: 'ID único do pet',
              example: 'abc123-def456'
            },
            nome: {
              type: 'string',
              description: 'Nome do pet',
              example: 'Rex'
            },
            foto: {
              type: 'string',
              description: 'URL da foto do pet',
              example: 'https://example.com/rex.jpg'
            },
            idade: {
              type: 'number',
              description: 'Idade do pet em anos',
              example: 3
            },
            raca: {
              type: 'string',
              description: 'Raça do pet',
              example: 'Golden Retriever'
            },
            peso: {
              type: 'number',
              description: 'Peso do pet em kg',
              example: 25.5
            },
            medicacoes: {
              type: 'string',
              description: 'Medicações do pet',
              example: 'Vacina antirrábica'
            },
            informacoes: {
              type: 'string',
              description: 'Informações adicionais',
              example: 'Pet muito dócil'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
              example: '2025-11-27T10:00:00Z'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Pets',
        description: 'Operações relacionadas a pets'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ]
  },
  apis: ['./src/api/**/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

const lifecycle = process.env.npm_lifecycle_event;
if (lifecycle === 'docs:build' || require.main === module) {
  try {
    const outDir = path.resolve(process.cwd(), 'docs');
    fs.mkdirSync(outDir, { recursive: true });

    const jsonPath = path.join(outDir, 'api-spec.json');
    fs.writeFileSync(jsonPath, JSON.stringify(swaggerSpec, null, 2), 'utf8');

    const yamlPath = path.join(outDir, 'api-spec.yaml');
    const yamlStr = yaml.dump(swaggerSpec, { noRefs: true });
    fs.writeFileSync(yamlPath, yamlStr, 'utf8');

    console.log('Wrote swagger docs to', outDir);
  } catch (err) {
    console.error('Failed to write swagger docs:', err);
    process.exit(1);
  }
}
