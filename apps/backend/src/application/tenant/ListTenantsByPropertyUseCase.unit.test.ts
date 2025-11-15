import { ListTenantsByPropertyUseCase } from './ListTenantsByPropertyUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Tenant, Property } from '@domain/entities';

describe('ListTenantsByPropertyUseCase', () => {
  let listTenantsByPropertyUseCase: ListTenantsByPropertyUseCase;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
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

    listTenantsByPropertyUseCase = new ListTenantsByPropertyUseCase(
      mockTenantRepository,
      mockPropertyRepository
    );
  });

  describe('execute', () => {
    it('should return tenants for a property', async () => {
      const mockProperty: Property = {
        id: 'prop-123',
        userId: 'user-123',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTenants: Tenant[] = [
        {
          id: 'tenant-1',
          userId: 'user-123',
          personId: 'person-1',
          propertyId: 'prop-123',
          leaseStartDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tenant-2',
          userId: 'user-123',
          personId: 'person-2',
          propertyId: 'prop-123',
          leaseStartDate: new Date('2023-01-01'),
          leaseEndDate: new Date('2023-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockTenantRepository.findByPropertyId.mockResolvedValue(mockTenants);

      const result = await listTenantsByPropertyUseCase.execute({
        userId: 'user-123',
        propertyId: 'prop-123',
      });

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('prop-123');
      expect(mockTenantRepository.findByPropertyId).toHaveBeenCalledWith('prop-123');
      expect(result).toEqual(mockTenants);
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(
        listTenantsByPropertyUseCase.execute({
          userId: 'user-123',
          propertyId: 'prop-999',
        })
      ).rejects.toThrow(new NotFoundError('Property', 'prop-999'));

      expect(mockTenantRepository.findByPropertyId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own the property', async () => {
      const mockProperty: Property = {
        id: 'prop-123',
        userId: 'user-456', // Different user
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      await expect(
        listTenantsByPropertyUseCase.execute({
          userId: 'user-123',
          propertyId: 'prop-123',
        })
      ).rejects.toThrow(new NotFoundError('Property', 'prop-123'));

      expect(mockTenantRepository.findByPropertyId).not.toHaveBeenCalled();
    });

    it('should return empty array when property has no tenants', async () => {
      const mockProperty: Property = {
        id: 'prop-123',
        userId: 'user-123',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockTenantRepository.findByPropertyId.mockResolvedValue([]);

      const result = await listTenantsByPropertyUseCase.execute({
        userId: 'user-123',
        propertyId: 'prop-123',
      });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
