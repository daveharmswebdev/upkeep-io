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

    // Prepare input data for validation (using API field names)
    const inputData: Record<string, any> = {};
    if (input.propertyId !== undefined) inputData.propertyId = input.propertyId;
    if (input.leaseStartDate !== undefined) inputData.leaseStartDate = input.leaseStartDate;
    if (input.leaseEndDate !== undefined) inputData.leaseEndDate = input.leaseEndDate;
    if (input.monthlyRent !== undefined) inputData.monthlyRent = input.monthlyRent;
    if (input.securityDeposit !== undefined) inputData.securityDeposit = input.securityDeposit;
    if (input.tenantNotes !== undefined) inputData.tenantNotes = input.tenantNotes;

    // Validate input data
    const validation = updateTenantSchema.safeParse(inputData);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Map validated data to domain structure (API field names -> domain field names)
    const updateData: Partial<Tenant> = {};
    if (validation.data.propertyId !== undefined) updateData.propertyId = validation.data.propertyId;
    if (validation.data.leaseStartDate !== undefined) {
      updateData.leaseStartDate = typeof validation.data.leaseStartDate === 'string'
        ? new Date(validation.data.leaseStartDate)
        : validation.data.leaseStartDate;
    }
    if (validation.data.leaseEndDate !== undefined) {
      updateData.leaseEndDate = typeof validation.data.leaseEndDate === 'string'
        ? new Date(validation.data.leaseEndDate)
        : validation.data.leaseEndDate;
    }
    if (validation.data.monthlyRent !== undefined) updateData.monthlyRent = validation.data.monthlyRent;
    if (validation.data.securityDeposit !== undefined) updateData.securityDeposit = validation.data.securityDeposit;
    if (validation.data.tenantNotes !== undefined) updateData.notes = validation.data.tenantNotes;

    // Update tenant
    const updatedTenant = await this.tenantRepository.update(input.tenantId, updateData);

    return updatedTenant;
  }
}
