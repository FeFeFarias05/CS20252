const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CS20252 API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

try {
  const outDir = path.resolve(process.cwd(), 'docs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'api-spec.json'), JSON.stringify(swaggerSpec, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'api-spec.yaml'), yaml.dump(swaggerSpec, { noRefs: true }), 'utf8');
  console.log('Wrote swagger docs to', outDir);
} catch (err) {
  console.error('Failed to write swagger docs:', err);
  process.exit(1);
}
