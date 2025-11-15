import { UpdatePropertyUseCase } from './UpdatePropertyUseCase';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError, ValidationError } from '@domain/errors';
import { Property } from '@domain/entities';

describe('UpdatePropertyUseCase', () => {
  let updatePropertyUseCase: UpdatePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    updatePropertyUseCase = new UpdatePropertyUseCase(mockPropertyRepository);
  });

  describe('execute', () => {
    const existingProperty: Property = {
      id: 'prop-123',
      userId: 'user-123',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      nickname: 'Old Nickname',
      purchaseDate: new Date('2023-01-01'),
      purchasePrice: 500000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update property when valid input provided', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'prop-123',
        address: '456 New St',
        city: 'Los Angeles',
      };

      const updatedProperty: Property = {
        ...existingProperty,
        address: '456 New St',
        city: 'Los Angeles',
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(existingProperty);
      mockPropertyRepository.update.mockResolvedValue(updatedProperty);

      const result = await updatePropertyUseCase.execute(input);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('prop-123');
      expect(mockPropertyRepository.update).toHaveBeenCalledWith('prop-123', expect.objectContaining({
        address: '456 New St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '94102',
      }));
      expect(result).toEqual(updatedProperty);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'nonexistent-prop',
        address: '456 New St',
      };

      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(updatePropertyUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('nonexistent-prop');
      expect(mockPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own the property', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'prop-123',
        address: '456 New St',
      };

      const otherUserProperty: Property = {
        ...existingProperty,
        userId: 'different-user-456',
      };

      mockPropertyRepository.findById.mockResolvedValue(otherUserProperty);

      await expect(updatePropertyUseCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('prop-123');
      expect(mockPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when updated data is invalid', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'prop-123',
        state: 'California', // Invalid - should be 2 characters
      };

      mockPropertyRepository.findById.mockResolvedValue(existingProperty);

      await expect(updatePropertyUseCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should update only specified fields', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'prop-123',
        nickname: 'New Nickname',
      };

      const updatedProperty: Property = {
        ...existingProperty,
        nickname: 'New Nickname',
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(existingProperty);
      mockPropertyRepository.update.mockResolvedValue(updatedProperty);

      const result = await updatePropertyUseCase.execute(input);

      expect(mockPropertyRepository.update).toHaveBeenCalledWith('prop-123', expect.objectContaining({
        nickname: 'New Nickname',
        address: existingProperty.address,
        city: existingProperty.city,
        state: existingProperty.state,
        zipCode: existingProperty.zipCode,
      }));
      expect(result).toEqual(updatedProperty);
    });

    it('should keep existing values when optional fields are undefined', async () => {
      const input = {
        userId: 'user-123',
        propertyId: 'prop-123',
        nickname: undefined,
        purchasePrice: undefined,
      };

      const updatedProperty: Property = {
        ...existingProperty,
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(existingProperty);
      mockPropertyRepository.update.mockResolvedValue(updatedProperty);

      await updatePropertyUseCase.execute(input);

      // When fields are undefined, should keep existing values
      expect(mockPropertyRepository.update).toHaveBeenCalledWith('prop-123', expect.objectContaining({
        nickname: existingProperty.nickname,
        purchasePrice: existingProperty.purchasePrice,
      }));
    });
  });
});
