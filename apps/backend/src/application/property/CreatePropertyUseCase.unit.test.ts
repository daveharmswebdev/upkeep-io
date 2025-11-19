import { CreatePropertyUseCase } from './CreatePropertyUseCase';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError } from '@domain/errors';
import { Property } from '@domain/entities';

describe('CreatePropertyUseCase', () => {
  let createPropertyUseCase: CreatePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createPropertyUseCase = new CreatePropertyUseCase(mockPropertyRepository);
  });

  describe('execute', () => {
    it('should create a property when valid input provided', async () => {
      const input = {
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: 'Downtown Property',
        purchaseDate: new Date('2023-01-01'),
        purchasePrice: 500000,
      };

      const mockProperty: Property = {
        id: 'prop-123',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.create.mockResolvedValue(mockProperty);

      const result = await createPropertyUseCase.execute(input);

      expect(mockPropertyRepository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockProperty);
    });

    it('should throw ValidationError when state code is invalid', async () => {
      const input = {
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'California', // Should be 2 characters
        zipCode: '94102',
      };

      await expect(createPropertyUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when zipCode is invalid', async () => {
      const input = {
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '1234', // Invalid format
      };

      await expect(createPropertyUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should create property without optional fields', async () => {
      const input = {
        userId: 'user-123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      const mockProperty: Property = {
        id: 'prop-123',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.create.mockResolvedValue(mockProperty);

      const result = await createPropertyUseCase.execute(input);

      expect(result).toEqual(mockProperty);
    });

    it('should create property with street and address2', async () => {
      const input = {
        userId: 'user-123',
        street: '456 Oak Ave',
        address2: 'Apt 5B',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      };

      const mockProperty: Property = {
        id: 'prop-456',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.create.mockResolvedValue(mockProperty);

      const result = await createPropertyUseCase.execute(input);

      expect(mockPropertyRepository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockProperty);
      expect(result.street).toBe('456 Oak Ave');
      expect(result.address2).toBe('Apt 5B');
    });
  });
});
