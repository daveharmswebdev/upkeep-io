import { CreateReceiptUseCase } from './CreateReceiptUseCase';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError, NotFoundError } from '@domain/errors';
import { Receipt, Property } from '@domain/entities';

describe('CreateReceiptUseCase', () => {
  let createReceiptUseCase: CreateReceiptUseCase;
  let mockReceiptRepository: jest.Mocked<IReceiptRepository>;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    mockReceiptRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByPropertyId: jest.fn(),
      findByUserId: jest.fn(),
      getTotalExpensesByPropertyForYear: jest.fn(),
      getTotalExpensesByUserForYear: jest.fn(),
    };

    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createReceiptUseCase = new CreateReceiptUseCase(
      mockReceiptRepository,
      mockPropertyRepository
    );
  });

  describe('execute', () => {
    const mockProperty: Property = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-123',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a receipt when valid input provided and user owns property', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        description: 'Paint and supplies',
      };

      const mockReceipt: Receipt = {
        id: 'receipt-123',
        userId: input.userId,
        propertyId: input.propertyId,
        amount: input.amount,
        category: 'materials',
        storeName: input.storeName,
        purchaseDate: input.purchaseDate,
        description: input.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockReceiptRepository.create.mockResolvedValue(mockReceipt);

      const result = await createReceiptUseCase.execute(input);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
      expect(mockReceiptRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
      }));
      expect(result).toEqual(mockReceipt);
    });

    it('should create receipt without optional fields', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 75.50,
        category: 'supplies',
        storeName: 'Lowes',
        purchaseDate: new Date('2024-01-20'),
      };

      const mockReceipt: Receipt = {
        id: 'receipt-456',
        userId: input.userId,
        propertyId: input.propertyId,
        amount: input.amount,
        category: 'supplies',
        storeName: input.storeName,
        purchaseDate: input.purchaseDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockReceiptRepository.create.mockResolvedValue(mockReceipt);

      const result = await createReceiptUseCase.execute(input);

      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '660e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'tools',
        storeName: 'Harbor Freight',
        purchaseDate: new Date('2024-01-15'),
      };

      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockReceiptRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own property', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
      };

      const otherUserProperty: Property = {
        ...mockProperty,
        userId: 'other-user',
      };

      mockPropertyRepository.findById.mockResolvedValue(otherUserProperty);

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockReceiptRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when amount is negative', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: -50.00,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
      };

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockPropertyRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when amount is zero', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 0,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
      };

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when category is invalid', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'invalid-category',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
      };

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when store name is empty', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.00,
        category: 'materials',
        storeName: '',
        purchaseDate: new Date('2024-01-15'),
      };

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when propertyId is not a valid UUID', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'not-a-uuid',
        amount: 100.00,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
      };

      await expect(createReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should create receipt with valid receiptImageUrl', async () => {
      const input = {
        userId: 'user-123',
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 200.00,
        category: 'appliances',
        storeName: 'Best Buy',
        purchaseDate: new Date('2024-01-15'),
        receiptImageUrl: 'https://example.com/receipt.jpg',
      };

      const mockReceipt: Receipt = {
        id: 'receipt-789',
        userId: input.userId,
        propertyId: input.propertyId,
        amount: input.amount,
        category: 'appliances',
        storeName: input.storeName,
        purchaseDate: input.purchaseDate,
        receiptImageUrl: input.receiptImageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockReceiptRepository.create.mockResolvedValue(mockReceipt);

      const result = await createReceiptUseCase.execute(input);

      expect(result.receiptImageUrl).toBe('https://example.com/receipt.jpg');
    });
  });
});
