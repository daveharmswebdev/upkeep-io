import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Tenant } from '@domain/entities';

export interface ListTenantsByPropertyInput {
  userId: string;
  propertyId: string;
}

@injectable()
export class ListTenantsByPropertyUseCase {
  constructor(
    @inject('ITenantRepository') private tenantRepository: ITenantRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: ListTenantsByPropertyInput): Promise<Tenant[]> {
    // Verify property exists and belongs to user
    const property = await this.propertyRepository.findById(input.propertyId);

    if (!property) {
      throw new NotFoundError('Property', input.propertyId);
    }

    if (property.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    const tenants = await this.tenantRepository.findByPropertyId(input.propertyId);
    return tenants;
  }
}
