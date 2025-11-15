import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { ValidationError, NotFoundError } from '@domain/errors';
import { updateTenantSchema } from '@validators/tenant';
import { Tenant } from '@domain/entities';

export interface UpdateTenantInput {
  userId: string;
  tenantId: string;
  propertyId?: string;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  tenantNotes?: string;
}

@injectable()
export class UpdateTenantUseCase {
  constructor(
    @inject('ITenantRepository') private tenantRepository: ITenantRepository
  ) {}

  async execute(input: UpdateTenantInput): Promise<Tenant> {
    // Get existing tenant
    const existingTenant = await this.tenantRepository.findById(input.tenantId);

    if (!existingTenant) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Ensure user owns this tenant
    if (existingTenant.userId !== input.userId) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Prepare update data
    const updateData: Partial<Tenant> = {};
    if (input.propertyId !== undefined) updateData.propertyId = input.propertyId;
    if (input.leaseStartDate !== undefined) updateData.leaseStartDate = input.leaseStartDate;
    if (input.leaseEndDate !== undefined) updateData.leaseEndDate = input.leaseEndDate;
    if (input.monthlyRent !== undefined) updateData.monthlyRent = input.monthlyRent;
    if (input.securityDeposit !== undefined) updateData.securityDeposit = input.securityDeposit;
    if (input.tenantNotes !== undefined) updateData.notes = input.tenantNotes;

    // Validate update data
    const validation = updateTenantSchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Update tenant
    const updatedTenant = await this.tenantRepository.update(input.tenantId, updateData);

    return updatedTenant;
  }
}
