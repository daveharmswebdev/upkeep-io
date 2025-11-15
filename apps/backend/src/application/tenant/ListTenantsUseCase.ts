import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '@domain/entities';

export interface ListTenantsInput {
  userId: string;
}

@injectable()
export class ListTenantsUseCase {
  constructor(
    @inject('ITenantRepository') private tenantRepository: ITenantRepository
  ) {}

  async execute(input: ListTenantsInput): Promise<Tenant[]> {
    const tenants = await this.tenantRepository.findByUserId(input.userId);
    return tenants;
  }
}
