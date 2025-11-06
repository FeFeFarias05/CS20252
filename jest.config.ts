import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
    // ✅ Transforma JS de node_modules (como jose)
    '^.+\\.(js)$': 'babel-jest',
  },

  // ✅ Agora removemos jose/node-fetch do ignore
  transformIgnorePatterns: [
    '/node_modules/(?!jose|node-fetch)/',
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFiles: ['dotenv/config'],
  testTimeout: 30000,
};

export default config;
