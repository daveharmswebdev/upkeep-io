import { DeletePropertyUseCase } from './DeletePropertyUseCase';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Property } from '@domain/entities';

describe('DeletePropertyUseCase', () => {
  let deletePropertyUseCase: DeletePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    deletePropertyUseCase = new DeletePropertyUseCase(mockPropertyRepository);
  });

  describe('execute', () => {
    it('should delete property when it exists and user owns it', async () => {
      const userId = 'user-123';
      const propertyId = 'prop-123';

      const mockProperty: Property = {
        id: propertyId,
        userId,
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue(undefined);

      await deletePropertyUseCase.execute({ userId, propertyId });

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(propertyId);
      expect(mockPropertyRepository.delete).toHaveBeenCalledWith(propertyId);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      const userId = 'user-123';
      const propertyId = 'nonexistent-prop';

      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(
        deletePropertyUseCase.execute({ userId, propertyId })
      ).rejects.toThrow(NotFoundError);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(propertyId);
      expect(mockPropertyRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own the property', async () => {
      const userId = 'user-123';
      const propertyId = 'prop-123';

      const mockProperty: Property = {
        id: propertyId,
        userId: 'different-user-456', // Different owner
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      await expect(
        deletePropertyUseCase.execute({ userId, propertyId })
      ).rejects.toThrow(NotFoundError);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(propertyId);
      expect(mockPropertyRepository.delete).not.toHaveBeenCalled();
    });

    it('should return void when deletion is successful', async () => {
      const userId = 'user-123';
      const propertyId = 'prop-123';

      const mockProperty: Property = {
        id: propertyId,
        userId,
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue(undefined);

      const result = await deletePropertyUseCase.execute({ userId, propertyId });

      expect(result).toBeUndefined();
    });
  });
});
