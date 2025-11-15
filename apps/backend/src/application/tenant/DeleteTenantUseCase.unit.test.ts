import { DeleteTenantUseCase } from './DeleteTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { NotFoundError } from '@domain/errors';
import { Tenant } from '@domain/entities';

describe('DeleteTenantUseCase', () => {
  let deleteTenantUseCase: DeleteTenantUseCase;
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

    deleteTenantUseCase = new DeleteTenantUseCase(mockTenantRepository);
  });

  describe('execute', () => {
    it('should soft delete tenant when it exists and user owns it', async () => {
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
      mockTenantRepository.softDelete.mockResolvedValue();

      await deleteTenantUseCase.execute({
        userId: 'user-123',
        tenantId: 'tenant-123',
      });

      expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-123');
      expect(mockTenantRepository.softDelete).toHaveBeenCalledWith('tenant-123');
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(
        deleteTenantUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-999',
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-999'));

      expect(mockTenantRepository.softDelete).not.toHaveBeenCalled();
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
        deleteTenantUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-123',
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-123'));

      expect(mockTenantRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
