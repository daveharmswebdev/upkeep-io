import { ZodError } from 'zod';
import { loginSchema } from './login';

describe('loginSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept single character password', () => {
      const validData = {
        email: 'test@example.com',
        password: 'p',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept very long password', () => {
      const validData = {
        email: 'test@example.com',
        password: 'A'.repeat(1000),
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept password with special characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'P@ssw0rd!#$%^&*()',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept password with spaces', () => {
      const validData = {
        email: 'test@example.com',
        password: 'my password has spaces',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept password with unicode characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'パスワード',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without @', () => {
      const invalidData = {
        email: 'testexample.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'test@',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without local part', () => {
      const invalidData = {
        email: '@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept email with plus sign', () => {
      const validData = {
        email: 'test+tag@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with dots in local part', () => {
      const validData = {
        email: 'first.last@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with subdomain', () => {
      const validData = {
        email: 'test@mail.example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with hyphen in domain', () => {
      const validData = {
        email: 'test@my-domain.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with numbers', () => {
      const validData = {
        email: 'test123@example456.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject email with whitespace', () => {
      const invalidData = {
        email: '  test@example.com  ',
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('password validation', () => {
    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept short password (no minimum length for login)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('should reject non-string email', () => {
      const invalidData = {
        email: 12345,
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 12345678,
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject null email', () => {
      const invalidData = {
        email: null,
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject undefined email', () => {
      const invalidData = {
        email: undefined,
        password: 'password123',
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject null password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: null,
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject undefined password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: undefined,
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('edge cases', () => {
    it('should strip extra fields from valid data', () => {
      const dataWithExtra = {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'should be ignored',
      };

      const result = loginSchema.parse(dataWithExtra);
      expect(result).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle empty object', () => {
      const emptyData = {};

      expect(() => loginSchema.parse(emptyData)).toThrow(ZodError);
    });

    it('should reject array instead of object', () => {
      const invalidData = ['test@example.com', 'password123'];

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject null', () => {
      expect(() => loginSchema.parse(null)).toThrow(ZodError);
    });

    it('should reject undefined', () => {
      expect(() => loginSchema.parse(undefined)).toThrow(ZodError);
    });
  });
});
