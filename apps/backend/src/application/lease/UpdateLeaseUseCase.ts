import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { LeaseWithDetails } from '@upkeep-io/domain';
import { NotFoundError, ValidationError } from '@upkeep-io/domain';
import { UpdateLeaseInput } from '@upkeep-io/validators';

@injectable()
export class UpdateLeaseUseCase {
  constructor(@inject('ILeaseRepository') private leaseRepository: ILeaseRepository) {}

  async execute(leaseId: string, userId: string, updates: UpdateLeaseInput): Promise<LeaseWithDetails> {
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // Cast updates to match repository interface (validator string literals -> enum)
    const updatedLease = await this.leaseRepository.update(leaseId, updates as any);

    return updatedLease;
  }
}
