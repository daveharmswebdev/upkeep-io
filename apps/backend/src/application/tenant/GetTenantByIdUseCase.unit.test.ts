import { GetTenantByIdUseCase } from './GetTenantByIdUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { NotFoundError } from '@domain/errors';
import { Tenant } from '@domain/entities';

describe('GetTenantByIdUseCase', () => {
  let getTenantByIdUseCase: GetTenantByIdUseCase;
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

    getTenantByIdUseCase = new GetTenantByIdUseCase(mockTenantRepository);
  });

  describe('execute', () => {
    it('should return tenant when it exists and user owns it', async () => {
      const mockTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-123',
        personId: 'person-123',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTenantRepository.findById.mockResolvedValue(mockTenant);

      const result = await getTenantByIdUseCase.execute({
        userId: 'user-123',
        tenantId: 'tenant-123',
      });

      expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-123');
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(
        getTenantByIdUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-999',
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-999'));
    });

    it('should throw NotFoundError when user does not own the tenant', async () => {
      const mockTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-456', // Different user
        personId: 'person-123',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTenantRepository.findById.mockResolvedValue(mockTenant);

      await expect(
        getTenantByIdUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-123',
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-123'));
    });
  });
});
