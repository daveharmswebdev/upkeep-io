import { CreateTenantUseCase } from './CreateTenantUseCase';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError, NotFoundError } from '@domain/errors';
import { Person, Tenant, Property } from '@domain/entities';

describe('CreateTenantUseCase', () => {
  let createTenantUseCase: CreateTenantUseCase;
  let mockPersonRepository: jest.Mocked<IPersonRepository>;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    mockPersonRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTenantRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByPropertyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createTenantUseCase = new CreateTenantUseCase(
      mockPersonRepository,
      mockTenantRepository,
      mockPropertyRepository
    );
  });

  describe('execute', () => {
    it('should create a tenant with inline person creation when valid input provided', async () => {
      const propertyId = '550e8400-e29b-41d4-a716-446655440000';

      const input = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        propertyId,
        leaseStartDate: new Date('2024-01-01'),
        monthlyRent: 2000,
        securityDeposit: 4000,
      };

      const mockProperty: Property = {
        id: propertyId,
        userId: 'user-123',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPerson: Person = {
        id: 'person-123',
        userId: 'user-123',
        personType: 'OWNER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-123',
        personId: 'person-123',
        propertyId,
        leaseStartDate: new Date('2024-01-01'),
        monthlyRent: 2000,
        securityDeposit: 4000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockTenantRepository.create.mockResolvedValue(mockTenant);

      const result = await createTenantUseCase.execute(input);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(propertyId);
      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        personType: 'OWNER',
        firstName: 'John',
        lastName: 'Doe',
        middleName: undefined,
        email: 'john.doe@example.com',
        phone: '5551234567',
        notes: undefined,
      });
      expect(mockTenantRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        personId: 'person-123',
        propertyId,
        leaseStartDate: input.leaseStartDate,
        leaseEndDate: undefined,
        monthlyRent: 2000,
        securityDeposit: 4000,
        notes: undefined,
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw ValidationError when email is invalid', async () => {
      const input = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '5551234567',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
      };

      await expect(createTenantUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      const propertyId = '550e8400-e29b-41d4-a716-446655440001';

      const input = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        propertyId,
        leaseStartDate: new Date('2024-01-01'),
      };

      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(createTenantUseCase.execute(input)).rejects.toThrow(
        new NotFoundError('Property', propertyId)
      );
    });

    it('should throw NotFoundError when user does not own the property', async () => {
      const propertyId = '550e8400-e29b-41d4-a716-446655440002';

      const input = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        propertyId,
        leaseStartDate: new Date('2024-01-01'),
      };

      const mockProperty: Property = {
        id: propertyId,
        userId: 'user-456', // Different user
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      await expect(createTenantUseCase.execute(input)).rejects.toThrow(
        new NotFoundError('Property', propertyId)
      );
    });

    it('should rollback person creation if tenant creation fails', async () => {
      const propertyId = '550e8400-e29b-41d4-a716-446655440003';

      const input = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        propertyId,
        leaseStartDate: new Date('2024-01-01'),
      };

      const mockProperty: Property = {
        id: propertyId,
        userId: 'user-123',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPerson: Person = {
        id: 'person-123',
        userId: 'user-123',
        personType: 'OWNER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '5551234567',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockTenantRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(createTenantUseCase.execute(input)).rejects.toThrow('Database error');
      expect(mockPersonRepository.delete).toHaveBeenCalledWith('person-123');
    });
  });
});
