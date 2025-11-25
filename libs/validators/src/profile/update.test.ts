import { ZodError } from 'zod';
import { updateProfileSchema } from './update';

describe('updateProfileSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid profile data with all fields', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const result = updateProfileSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept empty object (no update)', () => {
      const validData = {};

      const result = updateProfileSchema.parse(validData);
      expect(result).toEqual({});
    });

    it('should accept partial update with only firstName', () => {
      const validData = {
        firstName: 'Jane',
      };

      const result = updateProfileSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept partial update with only lastName', () => {
      const validData = {
        lastName: 'Smith',
      };

      const result = updateProfileSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept partial update with only phone', () => {
      const validData = {
        phone: '5551234567',
      };

      const result = updateProfileSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept maximum length firstName', () => {
      const validData = {
        firstName: 'A'.repeat(100),
      };

      expect(() => updateProfileSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length lastName', () => {
      const validData = {
        lastName: 'B'.repeat(100),
      };

      expect(() => updateProfileSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length phone', () => {
      const validData = {
        phone: '1'.repeat(20),
      };

      expect(() => updateProfileSchema.parse(validData)).not.toThrow();
    });

    it('should accept minimum length phone', () => {
      const validData = {
        phone: '1234567890', // exactly 10 digits
      };

      expect(() => updateProfileSchema.parse(validData)).not.toThrow();
    });
  });

  describe('field length validation', () => {
    it('should reject firstName longer than 100 characters', () => {
      const invalidData = {
        firstName: 'A'.repeat(101),
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lastName longer than 100 characters', () => {
      const invalidData = {
        lastName: 'B'.repeat(101),
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject phone longer than 20 characters', () => {
      const invalidData = {
        phone: '1'.repeat(21),
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject phone shorter than 10 characters', () => {
      const invalidData = {
        phone: '123456789', // 9 digits
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty firstName when provided', () => {
      const invalidData = {
        firstName: '',
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty lastName when provided', () => {
      const invalidData = {
        lastName: '',
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty phone when provided', () => {
      const invalidData = {
        phone: '',
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('strict mode validation', () => {
    it('should reject unknown fields', () => {
      const invalidData = {
        firstName: 'John',
        unknownField: 'value',
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject userId field (not updatable)', () => {
      const invalidData = {
        firstName: 'John',
        userId: 'user-123',
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('type validation', () => {
    it('should reject non-string firstName', () => {
      const invalidData = {
        firstName: 123,
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string lastName', () => {
      const invalidData = {
        lastName: 456,
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string phone', () => {
      const invalidData = {
        phone: 1234567890,
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
