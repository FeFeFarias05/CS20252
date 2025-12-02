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
    '^.+\\.(js)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    '/node_modules/(?!jose|node-fetch)/',
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  moduleDirectories: ['node_modules', '<rootDir>/src'],

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFiles: ['dotenv/config'],
  testTimeout: 30000,
};

export default config;
