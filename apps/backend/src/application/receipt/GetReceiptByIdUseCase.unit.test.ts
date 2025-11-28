import { GetReceiptByIdUseCase } from './GetReceiptByIdUseCase';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { NotFoundError } from '@domain/errors';
import { Receipt } from '@domain/entities';

describe('GetReceiptByIdUseCase', () => {
  let getReceiptByIdUseCase: GetReceiptByIdUseCase;
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

    getReceiptByIdUseCase = new GetReceiptByIdUseCase(mockReceiptRepository);
  });

  describe('execute', () => {
    it('should return receipt when found and user owns it', async () => {
      const mockReceipt: Receipt = {
        id: 'receipt-123',
        propertyId: 'property-123',
        userId: 'user-123',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        description: 'Paint and supplies',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReceiptRepository.findById.mockResolvedValue(mockReceipt);

      const result = await getReceiptByIdUseCase.execute({
        userId: 'user-123',
        receiptId: 'receipt-123',
      });

      expect(mockReceiptRepository.findById).toHaveBeenCalledWith('receipt-123');
      expect(result).toEqual(mockReceipt);
    });

    it('should throw NotFoundError when receipt does not exist', async () => {
      mockReceiptRepository.findById.mockResolvedValue(null);

      await expect(
        getReceiptByIdUseCase.execute({
          userId: 'user-123',
          receiptId: 'nonexistent-receipt',
        })
      ).rejects.toThrow(NotFoundError);
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
        getReceiptByIdUseCase.execute({
          userId: 'user-123',
          receiptId: 'receipt-123',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
