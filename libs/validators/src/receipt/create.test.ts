import { ZodError } from 'zod';
import { createReceiptSchema } from './create';

describe('createReceiptSchema', () => {
  describe('valid data', () => {
    it('should accept complete valid receipt data with all fields', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 123.45,
        category: 'materials' as const,
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        description: 'Lumber and screws for deck repair',
        receiptImageUrl: 'https://example.com/receipts/123.jpg',
      };

      const result = createReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept valid receipt data with only required fields', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 50.00,
        category: 'supplies' as const,
        storeName: 'Target',
        purchaseDate: new Date('2024-01-15'),
      };

      const result = createReceiptSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept HTML5 date format for purchaseDate', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 75.50,
        category: 'tools' as const,
        storeName: 'Harbor Freight',
        purchaseDate: '2024-01-15', // HTML5 date input format
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept datetime string for purchaseDate', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 200.00,
        category: 'appliances' as const,
        storeName: 'Best Buy',
        purchaseDate: '2024-01-15T10:30:00Z',
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept Date object for purchaseDate', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 89.99,
        category: 'fixtures' as const,
        storeName: 'Lowes',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
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
        const validData = {
          propertyId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100.00,
          category,
          storeName: 'Test Store',
          purchaseDate: new Date('2024-01-15'),
        };

        expect(() => createReceiptSchema.parse(validData)).not.toThrow();
      });
    });

    it('should accept maximum length storeName', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 150.00,
        category: 'landscaping' as const,
        storeName: 'S'.repeat(100),
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept maximum length description', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 99.99,
        category: 'cleaning' as const,
        storeName: 'Walmart',
        purchaseDate: new Date('2024-01-15'),
        description: 'D'.repeat(500),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty string description', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 45.00,
        category: 'other' as const,
        storeName: 'Local Store',
        purchaseDate: new Date('2024-01-15'),
        description: '',
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid HTTPS receipt image URL', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 250.00,
        category: 'materials' as const,
        storeName: 'Builders Supply',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 'https://storage.example.com/receipts/abc123.png',
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid HTTP receipt image URL', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 30.00,
        category: 'supplies' as const,
        storeName: 'Dollar Store',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 'http://example.com/receipt.jpg',
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty string receiptImageUrl', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 125.50,
        category: 'tools' as const,
        storeName: 'Tool World',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: '',
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept very small positive amount', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 0.01,
        category: 'supplies' as const,
        storeName: 'Penny Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept very large amount', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 99999.99,
        category: 'appliances' as const,
        storeName: 'Premium Appliances',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept current date for purchaseDate', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 55.00,
        category: 'cleaning' as const,
        storeName: 'Cleaning Supplies Co',
        purchaseDate: new Date(),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should accept past date for purchaseDate', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 88.88,
        category: 'fixtures' as const,
        storeName: 'Fixture World',
        purchaseDate: new Date('2020-01-01'),
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });
  });

  describe('required field validation', () => {
    it('should reject missing propertyId', () => {
      const invalidData = {
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing amount', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing category', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing storeName', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing purchaseDate', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty storeName', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: '',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('propertyId validation', () => {
    it('should reject invalid UUID format', () => {
      const invalidData = {
        propertyId: 'not-a-uuid',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty string propertyId', () => {
      const invalidData = {
        propertyId: '',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject numeric propertyId', () => {
      const invalidData = {
        propertyId: 12345,
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('amount validation', () => {
    it('should reject zero amount', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 0,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: -50.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-numeric amount', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: '100.00',
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject NaN amount', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: NaN,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('category validation', () => {
    it('should reject invalid category', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'invalid-category',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject numeric category', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 123,
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject category with wrong case', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'MATERIALS', // Must be lowercase
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('storeName validation', () => {
    it('should reject storeName longer than 100 characters', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'S'.repeat(101),
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string storeName', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 12345,
        purchaseDate: new Date('2024-01-15'),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('description validation', () => {
    it('should reject description longer than 500 characters', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        description: 'D'.repeat(501),
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string description', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        description: 12345,
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('purchaseDate validation', () => {
    it('should reject future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: futureDate,
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject invalid date string', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: 'not-a-date',
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    // Note: z.coerce.date() accepts numeric timestamps by design (e.g., Date.now())
    // This is expected behavior for date coercion
  });

  describe('receiptImageUrl validation', () => {
    it('should reject invalid URL format', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 'not-a-url',
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject URL without protocol', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 'example.com/receipt.jpg',
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-string receiptImageUrl', () => {
      const invalidData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 12345,
      };

      expect(() => createReceiptSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('optional fields', () => {
    it('should allow undefined description', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials' as const,
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        description: undefined,
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });

    it('should allow undefined receiptImageUrl', () => {
      const validData = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials' as const,
        storeName: 'Test Store',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: undefined,
      };

      expect(() => createReceiptSchema.parse(validData)).not.toThrow();
    });
  });
});
