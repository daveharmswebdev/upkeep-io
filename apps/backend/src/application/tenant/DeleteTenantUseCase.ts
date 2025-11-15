import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { NotFoundError } from '@domain/errors';

export interface DeleteTenantInput {
  userId: string;
  tenantId: string;
}

@injectable()
export class DeleteTenantUseCase {
  constructor(
    @inject('ITenantRepository') private tenantRepository: ITenantRepository
  ) {}

  async execute(input: DeleteTenantInput): Promise<void> {
    const tenant = await this.tenantRepository.findById(input.tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Ensure user owns this tenant
    if (tenant.userId !== input.userId) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Soft delete the tenant
    await this.tenantRepository.softDelete(input.tenantId);
  }
}
