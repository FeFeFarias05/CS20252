import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  testMatch: ['**/__tests__/**/*.test.ts'],

  transformIgnorePatterns: ['/node_modules/(?!jose|node-fetch)/'],

  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },

  setupFiles: ['dotenv/config'],

setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

};

export default config;
