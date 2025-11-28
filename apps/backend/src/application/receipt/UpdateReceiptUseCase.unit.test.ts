import { UpdateReceiptUseCase } from './UpdateReceiptUseCase';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { ValidationError, NotFoundError } from '@domain/errors';
import { Receipt } from '@domain/entities';

describe('UpdateReceiptUseCase', () => {
  let updateReceiptUseCase: UpdateReceiptUseCase;
  let mockReceiptRepository: jest.Mocked<IReceiptRepository>;

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

    updateReceiptUseCase = new UpdateReceiptUseCase(mockReceiptRepository);
  });

  describe('execute', () => {
    const existingReceipt: Receipt = {
      id: 'receipt-123',
      propertyId: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-123',
      amount: 150.75,
      category: 'materials',
      storeName: 'Home Depot',
      purchaseDate: new Date('2024-01-15'),
      description: 'Paint and supplies',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update receipt when valid input provided', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        amount: 200.00,
        storeName: 'Lowes',
      };

      const updatedReceipt: Receipt = {
        ...existingReceipt,
        amount: 200.00,
        storeName: 'Lowes',
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);
      mockReceiptRepository.update.mockResolvedValue(updatedReceipt);

      const result = await updateReceiptUseCase.execute(input);

      expect(mockReceiptRepository.findById).toHaveBeenCalledWith('receipt-123');
      expect(mockReceiptRepository.update).toHaveBeenCalledWith('receipt-123', expect.objectContaining({
        amount: 200.00,
        storeName: 'Lowes',
        category: 'materials', // Preserved from existing
        purchaseDate: existingReceipt.purchaseDate, // Preserved from existing
      }));
      expect(result).toEqual(updatedReceipt);
    });

    it('should update only specified fields and preserve others', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        category: 'tools' as const,
      };

      const updatedReceipt: Receipt = {
        ...existingReceipt,
        category: 'tools',
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);
      mockReceiptRepository.update.mockResolvedValue(updatedReceipt);

      const result = await updateReceiptUseCase.execute(input);

      expect(mockReceiptRepository.update).toHaveBeenCalledWith('receipt-123', expect.objectContaining({
        amount: 150.75, // Preserved
        storeName: 'Home Depot', // Preserved
        category: 'tools', // Updated
      }));
      expect(result.category).toBe('tools');
    });

    it('should throw NotFoundError when receipt does not exist', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'nonexistent-receipt',
        amount: 100.00,
      };

      mockReceiptRepository.findById.mockResolvedValue(null);

      await expect(updateReceiptUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockReceiptRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own receipt', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        amount: 100.00,
      };

      const otherUserReceipt: Receipt = {
        ...existingReceipt,
        userId: 'other-user',
      };

      mockReceiptRepository.findById.mockResolvedValue(otherUserReceipt);

      await expect(updateReceiptUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockReceiptRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when updated amount is negative', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        amount: -50.00,
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);

      await expect(updateReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockReceiptRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when updated category is invalid', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        category: 'invalid-category' as any,
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);

      await expect(updateReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when updated store name is empty', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        storeName: '',
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);

      await expect(updateReceiptUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should update optional fields to new values', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        description: 'Updated description',
        receiptImageUrl: 'https://example.com/new-receipt.jpg',
      };

      const updatedReceipt: Receipt = {
        ...existingReceipt,
        description: 'Updated description',
        receiptImageUrl: 'https://example.com/new-receipt.jpg',
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);
      mockReceiptRepository.update.mockResolvedValue(updatedReceipt);

      const result = await updateReceiptUseCase.execute(input);

      expect(result.description).toBe('Updated description');
      expect(result.receiptImageUrl).toBe('https://example.com/new-receipt.jpg');
    });

    it('should allow clearing optional fields with empty string', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        description: '',
        receiptImageUrl: '',
      };

      const updatedReceipt: Receipt = {
        ...existingReceipt,
        description: undefined,
        receiptImageUrl: undefined,
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);
      mockReceiptRepository.update.mockResolvedValue(updatedReceipt);

      await updateReceiptUseCase.execute(input);

      expect(mockReceiptRepository.update).toHaveBeenCalledWith('receipt-123', expect.objectContaining({
        description: '',
        receiptImageUrl: '',
      }));
    });

    it('should preserve propertyId (cannot be changed)', async () => {
      const input = {
        userId: 'user-123',
        receiptId: 'receipt-123',
        amount: 200.00,
      };

      const updatedReceipt: Receipt = {
        ...existingReceipt,
        amount: 200.00,
      };

      mockReceiptRepository.findById.mockResolvedValue(existingReceipt);
      mockReceiptRepository.update.mockResolvedValue(updatedReceipt);

      await updateReceiptUseCase.execute(input);

      // Verify that update was called without propertyId (it's excluded from UpdateReceiptData)
      expect(mockReceiptRepository.update).toHaveBeenCalledWith(
        'receipt-123',
        expect.not.objectContaining({ propertyId: expect.anything() })
      );
    });
  });
});
