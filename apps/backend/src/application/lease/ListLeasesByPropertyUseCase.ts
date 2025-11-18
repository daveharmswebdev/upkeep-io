import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { LeaseWithDetails } from '@upkeep-io/domain';
import { NotFoundError, ValidationError } from '@upkeep-io/domain';

@injectable()
export class ListLeasesByPropertyUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(propertyId: string, userId: string): Promise<LeaseWithDetails[]> {
    const property = await this.propertyRepository.findById(propertyId);

    if (!property) {
      throw new NotFoundError('Property', propertyId);
    }

    if (property.userId !== userId) {
      throw new ValidationError('Property does not belong to this user');
    }

    return await this.leaseRepository.findByPropertyId(propertyId);
  }
}
