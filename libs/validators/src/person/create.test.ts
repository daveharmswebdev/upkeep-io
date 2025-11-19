import { ZodError } from 'zod';
import { createPersonSchema, personTypeEnum } from './create';

describe('createPersonSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid person data with OWNER type', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Michael',
        email: 'john@example.com',
        phone: '1234567890',
        notes: 'Property owner',
      };

      const result = createPersonSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept valid person data with FAMILY_MEMBER type', () => {
      const validData = {
        personType: 'FAMILY_MEMBER' as const,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '0987654321',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid person data with VENDOR type', () => {
      const validData = {
        personType: 'VENDOR' as const,
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@construction.com',
        phone: '5551234567',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept person with only required fields', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com',
        phone: '1112223333',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept minimum length phone (10 digits)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length phone (20 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '12345678901234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length firstName (100 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'A'.repeat(100),
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length lastName (100 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'B'.repeat(100),
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length middleName (50 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'C'.repeat(50),
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length email (255 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'a'.repeat(243) + '@example.com', // 255 total (243 + 1 + 11 = 255)
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length notes (1000 characters)', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        notes: 'D'.repeat(1000),
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept phone with formatting characters', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept international phone format', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+44 20 7946 0958',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept name with special characters', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: "O'Brien",
        lastName: 'Smith-Jones',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept name with unicode characters', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'José',
        lastName: 'García',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('personType validation', () => {
    it('should reject invalid person type', () => {
      const invalidData = {
        personType: 'INVALID_TYPE',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lowercase person type', () => {
      const invalidData = {
        personType: 'owner',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing person type', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty string person type', () => {
      const invalidData = {
        personType: '',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('firstName validation', () => {
    it('should reject empty firstName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: '',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing firstName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject firstName longer than 100 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'A'.repeat(101),
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept single character firstName', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'J',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('lastName validation', () => {
    it('should reject empty lastName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: '',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing lastName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lastName longer than 100 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'B'.repeat(101),
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept single character lastName', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'D',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('middleName validation', () => {
    it('should allow undefined middleName', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        middleName: undefined,
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should allow missing middleName', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should reject middleName longer than 50 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'C'.repeat(51),
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept empty string middleName', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        middleName: '',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without @', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'testexample.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty email', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing email', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject email longer than 255 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'a'.repeat(244) + '@example.com', // 256 total (244 + 1 + 11 = 256)
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept email with plus sign', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test+tag@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should accept email with subdomain', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@mail.example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('phone validation', () => {
    it('should reject phone shorter than 10 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '123456789',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject phone longer than 20 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '123456789012345678901',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty phone', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing phone', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('notes validation', () => {
    it('should allow undefined notes', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        notes: undefined,
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should allow missing notes', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should reject notes longer than 1000 characters', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        notes: 'D'.repeat(1001),
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept empty string notes', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        notes: '',
      };

      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('should reject non-string firstName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 123,
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string lastName', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 456,
        email: 'test@example.com',
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string email', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 12345,
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string phone', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: 1234567890,
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject null email', () => {
      const invalidData = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: null,
        phone: '1234567890',
      };

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('personTypeEnum', () => {
    it('should accept OWNER enum value', () => {
      expect(() => personTypeEnum.parse('OWNER')).not.toThrow();
    });

    it('should accept FAMILY_MEMBER enum value', () => {
      expect(() => personTypeEnum.parse('FAMILY_MEMBER')).not.toThrow();
    });

    it('should accept VENDOR enum value', () => {
      expect(() => personTypeEnum.parse('VENDOR')).not.toThrow();
    });

    it('should reject invalid enum value', () => {
      expect(() => personTypeEnum.parse('INVALID')).toThrow(ZodError);
    });

    it('should reject lowercase enum value', () => {
      expect(() => personTypeEnum.parse('owner')).toThrow(ZodError);
    });
  });

  describe('edge cases', () => {
    it('should strip extra fields from valid data', () => {
      const dataWithExtra = {
        personType: 'OWNER' as const,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        extraField: 'should be ignored',
      };

      const result = createPersonSchema.parse(dataWithExtra);
      expect(result).not.toHaveProperty('extraField');
    });

    it('should handle whitespace in names', () => {
      const validData = {
        personType: 'OWNER' as const,
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'test@example.com',
        phone: '1234567890',
      };

      // Zod doesn't automatically trim, so this is valid
      expect(() => createPersonSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty object', () => {
      expect(() => createPersonSchema.parse({})).toThrow(ZodError);
    });

    it('should reject null', () => {
      expect(() => createPersonSchema.parse(null)).toThrow(ZodError);
    });

    it('should reject undefined', () => {
      expect(() => createPersonSchema.parse(undefined)).toThrow(ZodError);
    });

    it('should reject array instead of object', () => {
      const invalidData = ['OWNER', 'John', 'Doe'];

      expect(() => createPersonSchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
