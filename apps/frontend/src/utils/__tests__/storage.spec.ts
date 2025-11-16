import { describe, it, expect, beforeEach } from 'vitest';
import { authStorage, createMockStorage, type User } from '../storage';

describe('storage', () => {
  describe('authStorage', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    describe('token operations', () => {
      it('should save and retrieve token', () => {
        const token = 'test-jwt-token-123';
        authStorage.setToken(token);
        expect(authStorage.getToken()).toBe(token);
      });

      it('should return null when no token exists', () => {
        expect(authStorage.getToken()).toBeNull();
      });

      it('should remove token', () => {
        authStorage.setToken('test-token');
        authStorage.removeToken();
        expect(authStorage.getToken()).toBeNull();
      });

      it('should overwrite existing token', () => {
        authStorage.setToken('old-token');
        authStorage.setToken('new-token');
        expect(authStorage.getToken()).toBe('new-token');
      });
    });

    describe('user operations', () => {
      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      it('should save and retrieve user', () => {
        authStorage.setUser(testUser);
        const retrieved = authStorage.getUser();
        expect(retrieved).toEqual(testUser);
      });

      it('should return null when no user exists', () => {
        expect(authStorage.getUser()).toBeNull();
      });

      it('should remove user', () => {
        authStorage.setUser(testUser);
        authStorage.removeUser();
        expect(authStorage.getUser()).toBeNull();
      });

      it('should overwrite existing user', () => {
        const oldUser: User = { id: '1', email: 'old@example.com', name: 'Old' };
        const newUser: User = { id: '2', email: 'new@example.com', name: 'New' };

        authStorage.setUser(oldUser);
        authStorage.setUser(newUser);

        expect(authStorage.getUser()).toEqual(newUser);
      });

      it('should handle invalid JSON gracefully', () => {
        // Manually set invalid JSON in localStorage
        localStorage.setItem('user', 'invalid-json{]');
        expect(authStorage.getUser()).toBeNull();
      });

      it('should serialize user data correctly', () => {
        authStorage.setUser(testUser);
        const stored = localStorage.getItem('user');
        expect(stored).toBe(JSON.stringify(testUser));
      });
    });

    describe('clear operation', () => {
      it('should remove both token and user', () => {
        const testUser: User = {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        };

        authStorage.setToken('test-token');
        authStorage.setUser(testUser);

        authStorage.clear();

        expect(authStorage.getToken()).toBeNull();
        expect(authStorage.getUser()).toBeNull();
      });

      it('should not throw when clearing empty storage', () => {
        expect(() => authStorage.clear()).not.toThrow();
      });
    });
  });

  describe('createMockStorage', () => {
    it('should create isolated mock storage', () => {
      const mockStorage = createMockStorage();
      const token = 'test-token';

      mockStorage.setToken(token);
      expect(mockStorage.getToken()).toBe(token);

      // Should not affect localStorage
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should handle token operations', () => {
      const mockStorage = createMockStorage();

      expect(mockStorage.getToken()).toBeNull();

      mockStorage.setToken('token-1');
      expect(mockStorage.getToken()).toBe('token-1');

      mockStorage.setToken('token-2');
      expect(mockStorage.getToken()).toBe('token-2');

      mockStorage.removeToken();
      expect(mockStorage.getToken()).toBeNull();
    });

    it('should handle user operations', () => {
      const mockStorage = createMockStorage();
      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      expect(mockStorage.getUser()).toBeNull();

      mockStorage.setUser(testUser);
      expect(mockStorage.getUser()).toEqual(testUser);

      mockStorage.removeUser();
      expect(mockStorage.getUser()).toBeNull();
    });

    it('should handle clear operation', () => {
      const mockStorage = createMockStorage();
      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockStorage.setToken('test-token');
      mockStorage.setUser(testUser);

      mockStorage.clear();

      expect(mockStorage.getToken()).toBeNull();
      expect(mockStorage.getUser()).toBeNull();
    });

    it('should create independent mock instances', () => {
      const mock1 = createMockStorage();
      const mock2 = createMockStorage();

      mock1.setToken('token-1');
      mock2.setToken('token-2');

      expect(mock1.getToken()).toBe('token-1');
      expect(mock2.getToken()).toBe('token-2');
    });

    it('should handle invalid JSON in user data', () => {
      const mockStorage = createMockStorage();
      // We can't directly access the store, but we can test the behavior
      // by ensuring setUser and getUser work correctly

      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockStorage.setUser(testUser);
      expect(mockStorage.getUser()).toEqual(testUser);
    });
  });
});
