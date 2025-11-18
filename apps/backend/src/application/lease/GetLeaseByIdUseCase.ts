import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { LeaseWithDetails } from '@upkeep-io/domain';
import { NotFoundError, ValidationError } from '@upkeep-io/domain';

@injectable()
export class GetLeaseByIdUseCase {
  constructor(@inject('ILeaseRepository') private leaseRepository: ILeaseRepository) {}

  async execute(leaseId: string, userId: string): Promise<LeaseWithDetails> {
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    return lease;
  }
}
