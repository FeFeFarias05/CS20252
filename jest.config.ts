import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',

  // Transforma arquivos TS para que Jest entenda
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // Aqui estão os testes
  testMatch: ['**/__tests__/**/*.test.ts'],

  // ✅ Permite Jest transformar ES Modules no node_modules (ex: jose, node-fetch)
  transformIgnorePatterns: ['/node_modules/(?!jose|node-fetch)/'],

  // ✅ Se quiser mockar por padrão alguns módulos
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1', // suporte ao @ alias
  },

  // ✅ Carrega variáveis de ambiente antes dos testes
  setupFiles: ['dotenv/config'],
  
setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

};

export default config;
