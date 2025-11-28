import { ListReceiptsUseCase } from './ListReceiptsUseCase';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Receipt, Property } from '@domain/entities';

describe('ListReceiptsUseCase', () => {
  let listReceiptsUseCase: ListReceiptsUseCase;
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

    listReceiptsUseCase = new ListReceiptsUseCase(
      mockReceiptRepository,
      mockPropertyRepository
    );
  });

  describe('execute', () => {
    const mockReceipts: Receipt[] = [
      {
        id: 'receipt-1',
        propertyId: 'property-123',
        userId: 'user-123',
        amount: 150.75,
        category: 'materials',
        storeName: 'Home Depot',
        purchaseDate: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'receipt-2',
        propertyId: 'property-123',
        userId: 'user-123',
        amount: 75.50,
        category: 'supplies',
        storeName: 'Lowes',
        purchaseDate: new Date('2024-01-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should list all user receipts when no propertyId provided', async () => {
      mockReceiptRepository.findByUserId.mockResolvedValue({
        receipts: mockReceipts,
        total: 2,
      });
      mockReceiptRepository.getTotalExpensesByUserForYear.mockResolvedValue(1500.00);

      const result = await listReceiptsUseCase.execute({
        userId: 'user-123',
      });

      expect(mockReceiptRepository.findByUserId).toHaveBeenCalledWith('user-123', undefined);
      expect(mockReceiptRepository.getTotalExpensesByUserForYear).toHaveBeenCalledWith(
        'user-123',
        new Date().getFullYear()
      );
      expect(result).toEqual({
        receipts: mockReceipts,
        total: 2,
        ytdExpenses: 1500.00,
      });
    });

    it('should list receipts filtered by property when propertyId provided', async () => {
      const mockProperty: Property = {
        id: 'property-123',
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockReceiptRepository.findByPropertyId.mockResolvedValue({
        receipts: mockReceipts,
        total: 2,
      });
      mockReceiptRepository.getTotalExpensesByPropertyForYear.mockResolvedValue(750.25);

      const result = await listReceiptsUseCase.execute({
        userId: 'user-123',
        propertyId: 'property-123',
      });

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('property-123');
      expect(mockReceiptRepository.findByPropertyId).toHaveBeenCalledWith('property-123', undefined);
      expect(mockReceiptRepository.getTotalExpensesByPropertyForYear).toHaveBeenCalledWith(
        'property-123',
        new Date().getFullYear()
      );
      expect(result).toEqual({
        receipts: mockReceipts,
        total: 2,
        ytdExpenses: 750.25,
      });
    });

    it('should support pagination when listing user receipts', async () => {
      mockReceiptRepository.findByUserId.mockResolvedValue({
        receipts: [mockReceipts[0]],
        total: 10,
      });
      mockReceiptRepository.getTotalExpensesByUserForYear.mockResolvedValue(2000.00);

      const result = await listReceiptsUseCase.execute({
        userId: 'user-123',
        pagination: { skip: 0, take: 1 },
      });

      expect(mockReceiptRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        skip: 0,
        take: 1,
      });
      expect(result.receipts.length).toBe(1);
      expect(result.total).toBe(10);
    });

    it('should support pagination when listing property receipts', async () => {
      const mockProperty: Property = {
        id: 'property-123',
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockReceiptRepository.findByPropertyId.mockResolvedValue({
        receipts: [mockReceipts[0]],
        total: 5,
      });
      mockReceiptRepository.getTotalExpensesByPropertyForYear.mockResolvedValue(500.00);

      const result = await listReceiptsUseCase.execute({
        userId: 'user-123',
        propertyId: 'property-123',
        pagination: { skip: 5, take: 5 },
      });

      expect(mockReceiptRepository.findByPropertyId).toHaveBeenCalledWith('property-123', {
        skip: 5,
        take: 5,
      });
      expect(result.total).toBe(5);
    });

    it('should return empty list when no receipts found', async () => {
      mockReceiptRepository.findByUserId.mockResolvedValue({
        receipts: [],
        total: 0,
      });
      mockReceiptRepository.getTotalExpensesByUserForYear.mockResolvedValue(0);

      const result = await listReceiptsUseCase.execute({
        userId: 'user-123',
      });

      expect(result).toEqual({
        receipts: [],
        total: 0,
        ytdExpenses: 0,
      });
    });

    it('should throw NotFoundError when property does not exist', async () => {
      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(
        listReceiptsUseCase.execute({
          userId: 'user-123',
          propertyId: 'nonexistent-property',
        })
      ).rejects.toThrow(NotFoundError);

      expect(mockReceiptRepository.findByPropertyId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own property', async () => {
      const otherUserProperty: Property = {
        id: 'property-123',
        userId: 'other-user',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(otherUserProperty);

      await expect(
        listReceiptsUseCase.execute({
          userId: 'user-123',
          propertyId: 'property-123',
        })
      ).rejects.toThrow(NotFoundError);

      expect(mockReceiptRepository.findByPropertyId).not.toHaveBeenCalled();
    });
  });
});
