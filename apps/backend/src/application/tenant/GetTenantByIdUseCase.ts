import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { NotFoundError } from '@domain/errors';
import { Tenant } from '@domain/entities';

export interface GetTenantByIdInput {
  userId: string;
  tenantId: string;
}

@injectable()
export class GetTenantByIdUseCase {
  constructor(
    @inject('ITenantRepository') private tenantRepository: ITenantRepository
  ) {}

  async execute(input: GetTenantByIdInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(input.tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    // Ensure user owns this tenant
    if (tenant.userId !== input.userId) {
      throw new NotFoundError('Tenant', input.tenantId);
    }

    return tenant;
  }
}
