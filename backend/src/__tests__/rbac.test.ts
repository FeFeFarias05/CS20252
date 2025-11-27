// @ts-nocheck - Jest globals are injected at runtime
import { isAdmin, isOperator } from '../lib/auth/rbac';

describe('RBAC - Role-Based Access Control', () => {
  describe('isAdmin', () => {
    test('should return true for admin role', () => {
      const auth = { sub: 'user-1', roles: ['admin'] };
      expect(isAdmin(auth)).toBe(true);
    });

    test('should return true for user with multiple roles including admin', () => {
      const auth = { sub: 'user-1', roles: ['user', 'admin', 'operator'] };
      expect(isAdmin(auth)).toBe(true);
    });

    test('should return false for operator role', () => {
      const auth = { sub: 'user-1', roles: ['operator'] };
      expect(isAdmin(auth)).toBe(false);
    });

    test('should return false for user role', () => {
      const auth = { sub: 'user-1', roles: ['user'] };
      expect(isAdmin(auth)).toBe(false);
    });

    test('should return false for empty roles', () => {
      const auth = { sub: 'user-1', roles: [] };
      expect(isAdmin(auth)).toBe(false);
    });

    test('should return false for null auth', () => {
      expect(isAdmin(null)).toBe(false);
    });

    test('should return false for auth without roles property', () => {
      const auth = { sub: 'user-1' } as any;
      expect(isAdmin(auth)).toBe(false);
    });
  });

  describe('isOperator', () => {
    test('should return true for operator role', () => {
      const auth = { sub: 'user-1', roles: ['operator'] };
      expect(isOperator(auth)).toBe(true);
    });

    test('should return true for admin role (admin has operator privileges)', () => {
      const auth = { sub: 'user-1', roles: ['admin'] };
      expect(isOperator(auth)).toBe(true);
    });

    test('should return true for user with both operator and admin roles', () => {
      const auth = { sub: 'user-1', roles: ['operator', 'admin'] };
      expect(isOperator(auth)).toBe(true);
    });

    test('should return false for user role', () => {
      const auth = { sub: 'user-1', roles: ['user'] };
      expect(isOperator(auth)).toBe(false);
    });

    test('should return false for empty roles', () => {
      const auth = { sub: 'user-1', roles: [] };
      expect(isOperator(auth)).toBe(false);
    });

    test('should return false for null auth', () => {
      expect(isOperator(null)).toBe(false);
    });

    test('should return false for auth without roles property', () => {
      const auth = { sub: 'user-1' } as any;
      expect(isOperator(auth)).toBe(false);
    });
  });

  describe('Role hierarchy', () => {
    test('admin should have all operator privileges', () => {
      const adminAuth = { sub: 'admin-1', roles: ['admin'] };
      expect(isAdmin(adminAuth)).toBe(true);
      expect(isOperator(adminAuth)).toBe(true);
    });

    test('operator should not have admin privileges', () => {
      const operatorAuth = { sub: 'operator-1', roles: ['operator'] };
      expect(isOperator(operatorAuth)).toBe(true);
      expect(isAdmin(operatorAuth)).toBe(false);
    });

    test('user should have neither admin nor operator privileges', () => {
      const userAuth = { sub: 'user-1', roles: ['user'] };
      expect(isAdmin(userAuth)).toBe(false);
      expect(isOperator(userAuth)).toBe(false);
    });

    test('multiple roles should respect highest privilege', () => {
      const multiRoleAuth = { sub: 'user-1', roles: ['user', 'operator'] };
      expect(isOperator(multiRoleAuth)).toBe(true);
      expect(isAdmin(multiRoleAuth)).toBe(false);
    });
  });
});

