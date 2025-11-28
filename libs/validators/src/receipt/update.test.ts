import { ZodError } from 'zod';
import { updateReceiptSchema } from './update';

describe('updateReceiptSchema', () => {
  describe('valid partial updates', () => {
    it('should accept update with only amount', () => {
      const validData = {
        amount: 150.00,
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with only category', () => {
      const validData = {
        category: 'tools' as const,
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with only storeName', () => {
      const validData = {
        storeName: 'New Store Name',
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with only purchaseDate', () => {
      const validData = {
        purchaseDate: new Date('2024-02-01'),
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with only description', () => {
      const validData = {
        description: 'Updated description',
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with only receiptImageUrl', () => {
      const validData = {
        receiptImageUrl: 'https://example.com/new-receipt.jpg',
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with multiple fields', () => {
      const validData = {
        amount: 200.00,
        category: 'appliances' as const,
        storeName: 'Updated Store',
        purchaseDate: new Date('2024-03-01'),
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept update with all fields', () => {
      const validData = {
        amount: 175.50,
        category: 'fixtures' as const,
        storeName: 'Complete Update Store',
        purchaseDate: new Date('2024-04-01'),
        description: 'Fully updated receipt',
        receiptImageUrl: 'https://example.com/updated-receipt.png',
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept empty object (no updates)', () => {
      const validData = {};

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept HTML5 date format for purchaseDate', () => {
      const validData = {
        purchaseDate: '2024-01-15',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept datetime string for purchaseDate', () => {
      const validData = {
        purchaseDate: '2024-01-15T10:30:00Z',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept Date object for purchaseDate', () => {
      const validData = {
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept all valid receipt categories', () => {
      const categories = [
        'materials',
        'supplies',
        'tools',
        'appliances',
        'fixtures',
        'landscaping',
        'cleaning',
        'other',
      ];

      categories.forEach((category) => {
        const validData = { category };
        expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
      });
    });

    it('should accept empty string description to clear field', () => {
      const validData = {
        description: '',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty string receiptImageUrl to clear field', () => {
      const validData = {
        receiptImageUrl: '',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept clearing purchaseDate with empty string', () => {
      const validData = {
        purchaseDate: '',
      };

      const result = updateReceiptSchema.parse(validData);
      expect(result.purchaseDate).toBeUndefined();
    });

    it('should accept maximum length storeName', () => {
      const validData = {
        storeName: 'S'.repeat(100),
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length description', () => {
      const validData = {
        description: 'D'.repeat(500),
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid HTTPS receipt image URL', () => {
      const validData = {
        receiptImageUrl: 'https://storage.example.com/receipts/abc123.png',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid HTTP receipt image URL', () => {
      const validData = {
        receiptImageUrl: 'http://example.com/receipt.jpg',
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept very small positive amount', () => {
      const validData = {
        amount: 0.01,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept very large amount', () => {
      const validData = {
        amount: 99999.99,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept current date for purchaseDate', () => {
      const validData = {
        purchaseDate: new Date(),
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept past date for purchaseDate', () => {
      const validData = {
        purchaseDate: new Date('2020-01-01'),
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });
  });

  describe('validation with optional fields', () => {
    it('should still validate amount if provided', () => {
      const invalidData = {
        amount: 0,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate negative amount if provided', () => {
      const invalidData = {
        amount: -50.00,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate category if provided', () => {
      const invalidData = {
        category: 'invalid-category',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate storeName length if provided', () => {
      const invalidData = {
        storeName: 'S'.repeat(101),
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate empty storeName if provided', () => {
      const invalidData = {
        storeName: '',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate description length if provided', () => {
      const invalidData = {
        description: 'D'.repeat(501),
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate purchaseDate future restriction if provided', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        purchaseDate: futureDate,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate invalid date string if provided', () => {
      const invalidData = {
        purchaseDate: 'not-a-date',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate receiptImageUrl format if provided', () => {
      const invalidData = {
        receiptImageUrl: 'not-a-url',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should still validate URL without protocol if provided', () => {
      const invalidData = {
        receiptImageUrl: 'example.com/receipt.jpg',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('type validation', () => {
    it('should reject non-numeric amount', () => {
      const invalidData = {
        amount: '100.00',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject NaN amount', () => {
      const invalidData = {
        amount: NaN,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject numeric category', () => {
      const invalidData = {
        category: 123,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject category with wrong case', () => {
      const invalidData = {
        category: 'MATERIALS',
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string storeName', () => {
      const invalidData = {
        storeName: 12345,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string description', () => {
      const invalidData = {
        description: 12345,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    // Note: z.coerce.date() accepts numeric timestamps by design (e.g., Date.now())
    // This is expected behavior for date coercion

    it('should reject non-string receiptImageUrl', () => {
      const invalidData = {
        receiptImageUrl: 12345,
      };

      expect(() => updateReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('undefined fields', () => {
    it('should allow undefined amount', () => {
      const validData = {
        amount: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined category', () => {
      const validData = {
        category: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined storeName', () => {
      const validData = {
        storeName: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined purchaseDate', () => {
      const validData = {
        purchaseDate: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined description', () => {
      const validData = {
        description: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined receiptImageUrl', () => {
      const validData = {
        receiptImageUrl: undefined,
      };

      expect(() => updateReceiptSchema.parse(validData)).not.toThrow();
    });
  });
});
