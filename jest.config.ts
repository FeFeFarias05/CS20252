import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'], // carrega .env antes dos testes
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|node-fetch)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // :< remover .js dos imports TS
  },
};

export default config;
