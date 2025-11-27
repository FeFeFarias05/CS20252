// @ts-nocheck - Jest globals are injected at runtime
process.env.NODE_ENV = 'test';

// Mock jose module for ESM compatibility
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

// Setup environment variables for testing
process.env.DYNAMODB_TABLE_NAME = 'Pet';
process.env.DYNAMODB_OWNER_TABLE_NAME = 'Owner';
process.env.DYNAMODB_APPOINTMENT_TABLE_NAME = 'Appointment';
process.env.AWS_REGION = 'us-east-1';
process.env.JWKS_URI = 'https://cognito-idp.us-east-1.amazonaws.com/test/.well-known/jwks.json';
process.env.JWT_ISSUER = 'https://cognito-idp.us-east-1.amazonaws.com/test';
process.env.JWT_AUDIENCE = 'test-audience';
