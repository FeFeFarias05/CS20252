import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',

  // Transpila arquivos .ts / .tsx
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // Permitir transformar pacotes ESM como jose e node-fetch
  transformIgnorePatterns: [
    'node_modules/(?!(jose|node-fetch)/)',
  ],

  // Carregar variáveis do .env nos testes
  setupFiles: ['dotenv/config'],

  // Encontrar arquivos de teste
  testMatch: ['**/__tests__/**/*.test.ts'],
};

export default config;
