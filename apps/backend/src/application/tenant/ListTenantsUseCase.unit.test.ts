import { ListTenantsUseCase } from './ListTenantsUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '@domain/entities';

describe('ListTenantsUseCase', () => {
  let listTenantsUseCase: ListTenantsUseCase;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockTenantRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByPropertyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    listTenantsUseCase = new ListTenantsUseCase(mockTenantRepository);
  });

  describe('execute', () => {
    it('should return all tenants for user', async () => {
      const mockTenants: Tenant[] = [
        {
          id: 'tenant-1',
          userId: 'user-123',
          personId: 'person-1',
          propertyId: 'prop-1',
          leaseStartDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tenant-2',
          userId: 'user-123',
          personId: 'person-2',
          propertyId: 'prop-2',
          leaseStartDate: new Date('2024-02-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTenantRepository.findByUserId.mockResolvedValue(mockTenants);

      const result = await listTenantsUseCase.execute({ userId: 'user-123' });

      expect(mockTenantRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockTenants);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no tenants', async () => {
      mockTenantRepository.findByUserId.mockResolvedValue([]);

      const result = await listTenantsUseCase.execute({ userId: 'user-123' });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
