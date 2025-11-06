import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CS20252 API',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

// If invoked as a script (npm run docs:build), write spec files to docs/
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
