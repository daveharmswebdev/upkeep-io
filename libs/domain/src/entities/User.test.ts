import { User, CreateUserData } from './User';

describe('User types', () => {
  describe('User interface', () => {
    it('should accept valid User object', () => {
      const user: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBeDefined();
      expect(user.name).toBe('John Doe');
    });

    it('should have all required fields defined', () => {
      const user: User = {
        id: '123',
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        name: 'Jane Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('passwordHash');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should support Date objects for timestamps', () => {
      const now = new Date();
      const user: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        createdAt: now,
        updatedAt: now,
      };

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });
  });

  describe('CreateUserData interface', () => {
    it('should accept valid CreateUserData object', () => {
      const data: CreateUserData = {
        email: 'newuser@example.com',
        passwordHash: '$2b$10$hashedpassword',
        name: 'New User',
      };

      expect(data.email).toBe('newuser@example.com');
      expect(data.passwordHash).toBeDefined();
      expect(data.name).toBe('New User');
    });

    it('should have all required fields defined', () => {
      const data: CreateUserData = {
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test',
      };

      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('passwordHash');
      expect(data).toHaveProperty('name');
    });

    it('should not have id, createdAt, or updatedAt fields', () => {
      const data: CreateUserData = {
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
      };

      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('createdAt');
      expect(data).not.toHaveProperty('updatedAt');
    });
  });

  describe('type compatibility', () => {
    it('should allow assigning CreateUserData fields to User', () => {
      const createData: CreateUserData = {
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        name: 'User Name',
      };

      const user: User = {
        ...createData,
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.email).toBe(createData.email);
      expect(user.passwordHash).toBe(createData.passwordHash);
      expect(user.name).toBe(createData.name);
    });

    it('should handle different email formats', () => {
      const emails = [
        'simple@example.com',
        'with+tag@example.com',
        'with.dots@example.com',
        'user@subdomain.example.com',
      ];

      emails.forEach((email) => {
        const user: User = {
          id: '123',
          email,
          passwordHash: 'hash',
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.email).toBe(email);
      });
    });

    it('should handle different password hash formats', () => {
      const hashes = [
        '$2b$10$abcdefghijklmnopqrstuvwxyz',
        '$2a$12$zyxwvutsrqponmlkjihgfedcba',
        'plaintext', // Not recommended but type-wise valid
      ];

      hashes.forEach((hash) => {
        const user: User = {
          id: '123',
          email: 'test@example.com',
          passwordHash: hash,
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.passwordHash).toBe(hash);
      });
    });

    it('should handle different name formats', () => {
      const names = [
        'John Doe',
        'Mary Jane Smith',
        "O'Brien",
        'José García',
        'X',
        'A'.repeat(100),
      ];

      names.forEach((name) => {
        const user: User = {
          id: '123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.name).toBe(name);
      });
    });
  });
});
