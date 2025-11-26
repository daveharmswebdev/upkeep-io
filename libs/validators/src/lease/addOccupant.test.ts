import { ZodError } from 'zod';
import { addOccupantSchema } from './addOccupant';

describe('addOccupantSchema', () => {
  describe('using existing personId', () => {
    it('should validate with valid personId for adult occupant', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: true,
        moveInDate: new Date('2024-01-15'),
      };

      const result = addOccupantSchema.parse(data);

      expect(result.personId).toBe(data.personId);
      expect(result.isAdult).toBe(true);
      expect(result.moveInDate).toEqual(data.moveInDate);
    });

    it('should validate with valid personId for child occupant', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: false,
      };

      const result = addOccupantSchema.parse(data);

      expect(result.personId).toBe(data.personId);
      expect(result.isAdult).toBe(false);
    });

    it('should validate without moveInDate', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: true,
      };

      const result = addOccupantSchema.parse(data);

      expect(result.personId).toBe(data.personId);
      expect(result.moveInDate).toBeUndefined();
    });

    it('should reject invalid UUID format', () => {
      const data = {
        personId: 'invalid-uuid',
        isAdult: true,
      };

      expect(() => addOccupantSchema.parse(data)).toThrow(ZodError);
    });

    it('should reject when personId is provided with inline creation fields', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: true,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });
  });

  describe('inline creation for adult occupants', () => {
    it('should validate with all required fields for adult', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        moveInDate: new Date('2024-02-01'),
      };

      const result = addOccupantSchema.parse(data);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.email).toBe('jane.smith@example.com');
      expect(result.phone).toBe('555-987-6543');
      expect(result.isAdult).toBe(true);
    });

    it('should validate with optional middleName and notes', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Marie',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        notes: 'Primary contact',
      };

      const result = addOccupantSchema.parse(data);

      expect(result.middleName).toBe('Marie');
      expect(result.notes).toBe('Primary contact');
    });

    it('should reject adult without email', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-987-6543',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Adult occupants require email and phone');
    });

    it('should reject adult without phone', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Adult occupants require email and phone');
    });

    it('should reject adult without firstName', () => {
      const data = {
        isAdult: true,
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });

    it('should reject adult without lastName', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });

    it('should reject invalid email format', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'invalid-email',
        phone: '555-987-6543',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow(ZodError);
    });

    it('should reject phone that is too short', () => {
      const data = {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow(ZodError);
    });
  });

  describe('inline creation for child occupants', () => {
    it('should validate with firstName and lastName only', () => {
      const data = {
        isAdult: false,
        firstName: 'Tommy',
        lastName: 'Smith',
      };

      const result = addOccupantSchema.parse(data);

      expect(result.firstName).toBe('Tommy');
      expect(result.lastName).toBe('Smith');
      expect(result.isAdult).toBe(false);
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
    });

    it('should validate child with optional email and phone', () => {
      const data = {
        isAdult: false,
        firstName: 'Tommy',
        lastName: 'Smith',
        email: 'tommy@example.com',
        phone: '555-111-2222',
      };

      const result = addOccupantSchema.parse(data);

      expect(result.email).toBe('tommy@example.com');
      expect(result.phone).toBe('555-111-2222');
    });

    it('should validate child with middleName', () => {
      const data = {
        isAdult: false,
        firstName: 'Tommy',
        lastName: 'Smith',
        middleName: 'Lee',
      };

      const result = addOccupantSchema.parse(data);

      expect(result.middleName).toBe('Lee');
    });

    it('should validate child with moveInDate', () => {
      const data = {
        isAdult: false,
        firstName: 'Tommy',
        lastName: 'Smith',
        moveInDate: new Date('2024-03-01'),
      };

      const result = addOccupantSchema.parse(data);

      expect(result.moveInDate).toEqual(new Date('2024-03-01'));
    });

    it('should reject child without firstName', () => {
      const data = {
        isAdult: false,
        lastName: 'Smith',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });

    it('should reject child without lastName', () => {
      const data = {
        isAdult: false,
        firstName: 'Tommy',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });
  });

  describe('isAdult validation', () => {
    it('should reject when isAdult is missing', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('isAdult is required');
    });

    it('should reject when isAdult is not boolean', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: 'true' as any,
      };

      expect(() => addOccupantSchema.parse(data)).toThrow(ZodError);
    });
  });

  describe('neither personId nor inline fields', () => {
    it('should reject when neither personId nor inline fields are provided', () => {
      const data = {
        isAdult: true,
        moveInDate: new Date('2024-01-15'),
      };

      expect(() => addOccupantSchema.parse(data)).toThrow('Either provide personId OR fields');
    });
  });

  describe('date coercion', () => {
    it('should coerce string date to Date object', () => {
      const data = {
        personId: '550e8400-e29b-41d4-a716-446655440000',
        isAdult: true,
        moveInDate: '2024-01-15' as any,
      };

      const result = addOccupantSchema.parse(data);

      expect(result.moveInDate).toBeInstanceOf(Date);
      expect(result.moveInDate?.toISOString()).toContain('2024-01-15');
    });
  });
});
