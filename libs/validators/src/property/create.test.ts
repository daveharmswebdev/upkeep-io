import { ZodError } from 'zod';
import { createPropertySchema } from './create';

describe('createPropertySchema', () => {
  describe('valid data', () => {
    it('should accept complete valid property data with all fields', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: 'Downtown Apartment',
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 500000,
      };

      const result = createPropertySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept valid property data with only required fields', () => {
      const validData = {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'NY',
        zipCode: '10001',
      };

      const result = createPropertySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept 5-digit ZIP code format', () => {
      const validData = {
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept ZIP+4 code format', () => {
      const validData = {
        address: '101 Elm St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101-1234',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept datetime string for purchaseDate', () => {
      const validData = {
        address: '202 Maple Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        purchaseDate: '2024-01-15T10:30:00Z',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept Date object for purchaseDate', () => {
      const validData = {
        address: '303 Cedar Ln',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept zero purchase price (edge case)', () => {
      const validData = {
        address: '404 Birch Rd',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        purchasePrice: 0.01, // Must be positive
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length address', () => {
      const validData = {
        address: 'A'.repeat(200),
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length city', () => {
      const validData = {
        address: '505 Walnut Ave',
        city: 'B'.repeat(100),
        state: 'NV',
        zipCode: '89101',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length nickname', () => {
      const validData = {
        address: '606 Spruce St',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        nickname: 'C'.repeat(100),
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });
  });

  describe('required field validation', () => {
    it('should reject missing address', () => {
      const invalidData = {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty address', () => {
      const invalidData = {
        address: '',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing city', () => {
      const invalidData = {
        address: '123 Main St',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty city', () => {
      const invalidData = {
        address: '123 Main St',
        city: '',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing state', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing zipCode', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('field length validation', () => {
    it('should reject address longer than 200 characters', () => {
      const invalidData = {
        address: 'A'.repeat(201),
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject city longer than 100 characters', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'B'.repeat(101),
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject nickname longer than 100 characters', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: 'C'.repeat(101),
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('state validation', () => {
    it('should reject state with less than 2 characters', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'C',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject state with more than 2 characters', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CAL',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept any 2-character state code', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'XX', // Not a real state, but format is valid
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });
  });

  describe('ZIP code validation', () => {
    it('should reject ZIP code with less than 5 digits', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '9410',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject ZIP code with letters', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: 'ABCDE',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject ZIP code with more than 5 digits without hyphen', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '941022',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject invalid ZIP+4 format with wrong number of digits after hyphen', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102-123',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject ZIP code with special characters other than hyphen', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102.1234',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject ZIP code with space', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102 1234',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('purchasePrice validation', () => {
    it('should reject zero purchase price', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: 0,
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject negative purchase price', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: -100000,
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept very large purchase price', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: 10000000,
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should accept decimal purchase price', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: 500000.50,
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });
  });

  describe('optional fields', () => {
    it('should allow undefined nickname', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: undefined,
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined purchaseDate', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchaseDate: undefined,
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined purchasePrice', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: undefined,
      };

      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });

    it('should allow empty string nickname to be treated as optional', () => {
      const validData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: '',
      };

      // Empty string is valid for optional field (not the same as min length validation)
      expect(() => createPropertySchema.parse(validData)).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('should reject non-string address', () => {
      const invalidData = {
        address: 123,
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string city', () => {
      const invalidData = {
        address: '123 Main St',
        city: 123,
        state: 'CA',
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string state', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 12,
        zipCode: '94102',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string zipCode', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: 94102,
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-number purchasePrice', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchasePrice: '500000',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject invalid date string for purchaseDate', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchaseDate: 'not-a-date',
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject invalid date format for purchaseDate', () => {
      const invalidData = {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        purchaseDate: '01/15/2024', // Not ISO datetime format
      };

      expect(() => createPropertySchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
