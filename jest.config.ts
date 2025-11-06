import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm', // ✅ importante para TypeScript + ESM

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: 'tsconfig.json',
      useESM: true 
    }],
  },

  // ✅ Permite transformar jose e node-fetch (são ESM)
  transformIgnorePatterns: [
    'node_modules/(?!jose|node-fetch)'
  ],

  // ✅ Resolve imports ESM (.js, .ts)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // ✅ Corrige mapeamento de import com caminho relativo
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
};

export default config;
