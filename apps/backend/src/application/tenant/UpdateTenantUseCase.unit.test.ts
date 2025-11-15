import { UpdateTenantUseCase } from './UpdateTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { NotFoundError } from '@domain/errors';
import { Tenant } from '@domain/entities';

describe('UpdateTenantUseCase', () => {
  let updateTenantUseCase: UpdateTenantUseCase;
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

    updateTenantUseCase = new UpdateTenantUseCase(mockTenantRepository);
  });

  describe('execute', () => {
    it('should update tenant when valid input provided', async () => {
      const existingTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-123',
        personId: 'person-123',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
        monthlyRent: 2000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTenant: Tenant = {
        ...existingTenant,
        monthlyRent: 2200,
        securityDeposit: 4400,
      };

      mockTenantRepository.findById.mockResolvedValue(existingTenant);
      mockTenantRepository.update.mockResolvedValue(updatedTenant);

      const result = await updateTenantUseCase.execute({
        userId: 'user-123',
        tenantId: 'tenant-123',
        monthlyRent: 2200,
        securityDeposit: 4400,
      });

      expect(mockTenantRepository.findById).toHaveBeenCalledWith('tenant-123');
      expect(mockTenantRepository.update).toHaveBeenCalledWith('tenant-123', {
        monthlyRent: 2200,
        securityDeposit: 4400,
      });
      expect(result).toEqual(updatedTenant);
    });

    it('should throw NotFoundError when tenant does not exist', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);

      await expect(
        updateTenantUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-999',
          monthlyRent: 2200,
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-999'));

      expect(mockTenantRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not own the tenant', async () => {
      const existingTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-456', // Different user
        personId: 'person-123',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTenantRepository.findById.mockResolvedValue(existingTenant);

      await expect(
        updateTenantUseCase.execute({
          userId: 'user-123',
          tenantId: 'tenant-123',
          monthlyRent: 2200,
        })
      ).rejects.toThrow(new NotFoundError('Tenant', 'tenant-123'));

      expect(mockTenantRepository.update).not.toHaveBeenCalled();
    });

    it('should update lease dates successfully', async () => {
      const existingTenant: Tenant = {
        id: 'tenant-123',
        userId: 'user-123',
        personId: 'person-123',
        propertyId: 'prop-123',
        leaseStartDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTenant: Tenant = {
        ...existingTenant,
        leaseEndDate: new Date('2024-12-31'),
      };

      mockTenantRepository.findById.mockResolvedValue(existingTenant);
      mockTenantRepository.update.mockResolvedValue(updatedTenant);

      const result = await updateTenantUseCase.execute({
        userId: 'user-123',
        tenantId: 'tenant-123',
        leaseEndDate: new Date('2024-12-31'),
      });

      expect(result.leaseEndDate).toEqual(new Date('2024-12-31'));
    });
  });
});
