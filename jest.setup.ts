// @ts-nocheck
/// <reference types="jest" />
import '@testing-library/jest-dom';

// Evita falhas de conexão com DynamoDB real durante testes
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    UpdateCommand: jest.fn(),
    DeleteCommand: jest.fn(),
  };
});
