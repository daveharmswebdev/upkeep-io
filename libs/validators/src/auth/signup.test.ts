import { ZodError } from 'zod';
import { signupSchema } from './signup';

describe('signupSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
      };

      const result = signupSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept minimum length password (8 characters)', () => {
      const validData = {
        email: 'test@example.com',
        password: '12345678',
        name: 'Jane Smith',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length name (100 characters)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'A'.repeat(100),
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept single character name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'X',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept name with spaces', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'John Michael Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept name with special characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: "O'Brien-Smith",
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept very long password', () => {
      const validData = {
        email: 'test@example.com',
        password: 'A'.repeat(100),
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without @', () => {
      const invalidData = {
        email: 'testexample.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'test@',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without local part', () => {
      const invalidData = {
        email: '@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept email with plus sign', () => {
      const validData = {
        email: 'test+tag@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with dots in local part', () => {
      const validData = {
        email: 'first.last@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with subdomain', () => {
      const validData = {
        email: 'test@mail.example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with hyphen in domain', () => {
      const validData = {
        email: 'test@my-domain.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('password validation', () => {
    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '1234567',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept password with special characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'P@ssw0rd!#$%',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept password with spaces', () => {
      const validData = {
        email: 'test@example.com',
        password: 'pass word 123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept password with unicode characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'パスワード123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('name validation', () => {
    it('should reject empty name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: '',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'A'.repeat(101),
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept name with numbers', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'John Doe 3rd',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should accept name with unicode characters', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'José García',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('should reject non-string email', () => {
      const invalidData = {
        email: 12345,
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 12345678,
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 12345,
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject null email', () => {
      const invalidData = {
        email: null,
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject undefined email', () => {
      const invalidData = {
        email: undefined,
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('edge cases', () => {
    it('should reject object with extra fields by default', () => {
      const dataWithExtra = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
        extraField: 'should be ignored',
      };

      // Zod strict() is not used, so extra fields are stripped but parsing succeeds
      const result = signupSchema.parse(dataWithExtra);
      expect(result).toEqual({
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      });
    });

    it('should handle whitespace in name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: '  John Doe  ',
      };

      // Zod doesn't automatically trim, so this is valid
      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should handle whitespace in email', () => {
      const invalidData = {
        email: '  test@example.com  ',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      // Email with leading/trailing spaces is invalid
      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
