import { DeleteReceiptUseCase } from './DeleteReceiptUseCase';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { NotFoundError } from '@domain/errors';
import { Receipt } from '@domain/entities';

describe('DeleteReceiptUseCase', () => {
  let deleteReceiptUseCase: DeleteReceiptUseCase;
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

    deleteReceiptUseCase = new DeleteReceiptUseCase(mockReceiptRepository);
  });

  describe('execute', () => {
    it('should delete receipt when it exists and user owns it', async () => {
      const mockReceipt: Receipt = {
        id: 'receipt-123',
        propertyId: 'property-123',
        userId: 'user-123',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReceiptRepository.findById.mockResolvedValue(mockReceipt);
      mockReceiptRepository.delete.mockResolvedValue(undefined);

      await deleteReceiptUseCase.execute({
        userId: 'user-123',
        receiptId: 'receipt-123',
      });

      expect(mockReceiptRepository.findById).toHaveBeenCalledWith('receipt-123');
      expect(mockReceiptRepository.delete).toHaveBeenCalledWith('receipt-123');
    });

    it('should throw NotFoundError when receipt does not exist', async () => {
      mockReceiptRepository.findById.mockResolvedValue(null);

      await expect(
        deleteReceiptUseCase.execute({
          userId: 'user-123',
          receiptId: 'nonexistent-receipt',
        })
      ).rejects.toThrow(NotFoundError);

      expect(mockReceiptRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own receipt', async () => {
      const mockReceipt: Receipt = {
        id: 'receipt-123',
        propertyId: 'property-123',
        userId: 'other-user',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReceiptRepository.findById.mockResolvedValue(mockReceipt);

      await expect(
        deleteReceiptUseCase.execute({
          userId: 'user-123',
          receiptId: 'receipt-123',
        })
      ).rejects.toThrow(NotFoundError);

      expect(mockReceiptRepository.delete).not.toHaveBeenCalled();
    });
  });
});
