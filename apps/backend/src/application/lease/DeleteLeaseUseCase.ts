import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { NotFoundError, ValidationError } from '@domain/errors';

@injectable()
export class DeleteLeaseUseCase {
  constructor(@inject('ILeaseRepository') private leaseRepository: ILeaseRepository) {}

  async execute(leaseId: string, userId: string): Promise<void> {
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    await this.leaseRepository.softDelete(leaseId);
  }
}
