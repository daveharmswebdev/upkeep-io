import { ZodError } from 'zod';
import { createLeaseSchema } from './create';

describe('createLeaseSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid lease data with existing person', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyRent: 2000,
        securityDeposit: 4000,
        depositPaidDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
            signedDate: new Date('2023-12-15'),
          },
        ],
        occupants: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174002',
            isAdult: true,
            moveInDate: new Date('2024-01-01'),
          },
        ],
      };

      const result = createLeaseSchema.parse(validData);
      expect(result.propertyId).toBe(validData.propertyId);
      expect(result.lessees).toHaveLength(1);
    });

    it('should accept lease data with inline lessee creation', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept lease data with inline occupant creation (adult)', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '0987654321',
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept lease data with inline occupant creation (child without email/phone)', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            firstName: 'Tommy',
            lastName: 'Doe',
            isAdult: false,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept multiple lessees', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '0987654321',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept lease with only required fields', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept string dates that can be coerced', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
            signedDate: '2023-12-15',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept zero security deposit', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        securityDeposit: 0,
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept lessee with optional fields', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            email: 'john@example.com',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });
  });

  describe('propertyId validation', () => {
    it('should reject invalid UUID format', () => {
      const invalidData = {
        propertyId: 'not-a-uuid',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing propertyId', () => {
      const invalidData = {
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('date validation', () => {
    it('should reject missing startDate', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject endDate before startDate', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject same startDate and endDate', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept invalid date string', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: 'not-a-date',
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('financial validation', () => {
    it('should reject zero monthly rent', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        monthlyRent: 0,
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject negative monthly rent', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        monthlyRent: -1000,
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject negative security deposit', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        securityDeposit: -1000,
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept decimal monthly rent', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        monthlyRent: 2000.50,
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });
  });

  describe('lessee validation', () => {
    it('should reject lease without lessees', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lessee with both personId and inline creation fields', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lessee with neither personId nor inline creation fields', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            signedDate: new Date('2023-12-15'),
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject inline lessee creation without email', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject inline lessee creation without phone', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject inline lessee creation without firstName', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject inline lessee creation without lastName', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            email: 'john@example.com',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lessee with invalid UUID', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: 'not-a-uuid',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lessee with invalid email format', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'not-an-email',
            phone: '1234567890',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject lessee with phone shorter than 10 characters', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '123',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('occupant validation', () => {
    it('should reject occupant with both personId and inline creation fields', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174002',
            firstName: 'Jane',
            lastName: 'Doe',
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject occupant with neither personId nor inline creation fields', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject adult occupant without email when creating inline', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '0987654321',
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject adult occupant without phone when creating inline', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject occupant without isAdult field', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            firstName: 'Tommy',
            lastName: 'Doe',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject occupant with invalid UUID', () => {
      const invalidData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [
          {
            personId: 'not-a-uuid',
            isAdult: true,
          },
        ],
      };

      expect(() => createLeaseSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('edge cases', () => {
    it('should accept lease with empty occupants array', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        occupants: [],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should accept lease without occupants field', () => {
      const validData = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
      };

      expect(() => createLeaseSchema.parse(validData)).not.toThrow();
    });

    it('should strip extra fields from valid data', () => {
      const dataWithExtra = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date('2024-01-01'),
        lessees: [
          {
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        extraField: 'should be ignored',
      };

      const result = createLeaseSchema.parse(dataWithExtra);
      expect(result).not.toHaveProperty('extraField');
    });
  });
});
