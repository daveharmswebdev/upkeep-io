import { describe, it, expect } from 'vitest';
import { convertFormDateToDate, convertFormDates, convertNestedDates, formatDateForInput } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('convertFormDateToDate', () => {
    it('should convert valid date string to Date object', () => {
      const result = convertFormDateToDate('2024-01-15T12:00:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January = 0
      // Don't test exact date due to timezone variations
    });

    it('should handle ISO date strings', () => {
      const result = convertFormDateToDate('2024-01-15T12:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return undefined for empty string', () => {
      const result = convertFormDateToDate('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = convertFormDateToDate(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle different date formats', () => {
      const result1 = convertFormDateToDate('2024-12-31T12:00:00');
      expect(result1?.getMonth()).toBe(11); // December = 11

      const result2 = convertFormDateToDate('2024-02-29T12:00:00'); // Leap year
      expect(result2?.getMonth()).toBe(1); // February = 1
    });
  });

  describe('convertFormDates', () => {
    it('should convert specified date fields to Date objects', () => {
      const formData = {
        name: 'Test Property',
        purchaseDate: '2024-01-15',
        saleDate: '2024-12-31',
      };

      const result = convertFormDates(formData, ['purchaseDate', 'saleDate']);

      expect(result.name).toBe('Test Property');
      expect(result.purchaseDate).toBeInstanceOf(Date);
      expect(result.saleDate).toBeInstanceOf(Date);
    });

    it('should not mutate the original object', () => {
      const formData = {
        name: 'Test',
        purchaseDate: '2024-01-15',
      };

      const result = convertFormDates(formData, ['purchaseDate']);

      expect(result).not.toBe(formData);
      expect(formData.purchaseDate).toBe('2024-01-15'); // Original unchanged
      expect(result.purchaseDate).toBeInstanceOf(Date);
    });

    it('should handle optional date fields (undefined)', () => {
      const formData = {
        name: 'Test',
        startDate: '2024-01-15',
        endDate: undefined,
      };

      const result = convertFormDates(formData, ['startDate', 'endDate']);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeUndefined();
    });

    it('should handle missing fields gracefully', () => {
      const formData = {
        name: 'Test',
        startDate: '2024-01-15',
      };

      const result = convertFormDates(formData, ['startDate', 'nonexistentField']);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('nonexistentField');
    });

    it('should preserve non-date fields unchanged', () => {
      const formData = {
        id: 123,
        name: 'Test',
        active: true,
        price: 1234.56,
        purchaseDate: '2024-01-15',
      };

      const result = convertFormDates(formData, ['purchaseDate']);

      expect(result.id).toBe(123);
      expect(result.name).toBe('Test');
      expect(result.active).toBe(true);
      expect(result.price).toBe(1234.56);
    });

    it('should handle empty dateFields array', () => {
      const formData = {
        name: 'Test',
        purchaseDate: '2024-01-15',
      };

      const result = convertFormDates(formData, []);

      expect(result.purchaseDate).toBe('2024-01-15'); // Unchanged
    });
  });

  describe('convertNestedDates', () => {
    it('should convert date fields in array of objects', () => {
      const items = [
        { name: 'John', signedDate: '2024-01-15' },
        { name: 'Jane', signedDate: '2024-02-20' },
      ];

      const result = convertNestedDates(items, ['signedDate']);

      expect(result).toHaveLength(2);
      expect(result[0].signedDate).toBeInstanceOf(Date);
      expect(result[1].signedDate).toBeInstanceOf(Date);
      expect(result[0].name).toBe('John');
      expect(result[1].name).toBe('Jane');
    });

    it('should not mutate the original array or objects', () => {
      const items = [{ name: 'John', signedDate: '2024-01-15' }];

      const result = convertNestedDates(items, ['signedDate']);

      expect(result).not.toBe(items);
      expect(result[0]).not.toBe(items[0]);
      expect(items[0].signedDate).toBe('2024-01-15'); // Original unchanged
    });

    it('should handle multiple date fields per object', () => {
      const items = [
        {
          name: 'John',
          signedDate: '2024-01-15',
          moveInDate: '2024-02-01',
        },
      ];

      const result = convertNestedDates(items, ['signedDate', 'moveInDate']);

      expect(result[0].signedDate).toBeInstanceOf(Date);
      expect(result[0].moveInDate).toBeInstanceOf(Date);
    });

    it('should handle optional dates in nested objects', () => {
      const items = [
        { name: 'John', signedDate: '2024-01-15', moveInDate: undefined },
        { name: 'Jane', signedDate: undefined, moveInDate: '2024-02-01' },
      ];

      const result = convertNestedDates(items, ['signedDate', 'moveInDate']);

      expect(result[0].signedDate).toBeInstanceOf(Date);
      expect(result[0].moveInDate).toBeUndefined();
      expect(result[1].signedDate).toBeUndefined();
      expect(result[1].moveInDate).toBeInstanceOf(Date);
    });

    it('should handle empty array', () => {
      const result = convertNestedDates([], ['signedDate']);
      expect(result).toEqual([]);
    });

    it('should preserve all non-date fields in nested objects', () => {
      const items = [
        {
          id: 1,
          name: 'John',
          email: 'john@example.com',
          active: true,
          signedDate: '2024-01-15',
        },
      ];

      const result = convertNestedDates(items, ['signedDate']);

      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('John');
      expect(result[0].email).toBe('john@example.com');
      expect(result[0].active).toBe(true);
    });
  });

  describe('formatDateForInput', () => {
    it('should convert Date object to YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateForInput(date)).toBe('2024-01-15');
    });

    it('should convert ISO string to YYYY-MM-DD format', () => {
      const dateString = '2024-01-15T10:30:00Z';
      expect(formatDateForInput(dateString as any)).toBe('2024-01-15');
    });

    it('should return undefined for undefined input', () => {
      expect(formatDateForInput(undefined)).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      expect(formatDateForInput(null as any)).toBeUndefined();
    });

    it('should handle dates with different times correctly', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      expect(formatDateForInput(date)).toBe('2024-12-31');
    });
  });
});
