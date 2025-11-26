import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { LeaseWithDetails } from '@domain/entities';

@injectable()
export class ListLeasesUseCase {
  constructor(@inject('ILeaseRepository') private leaseRepository: ILeaseRepository) {}

  async execute(userId: string): Promise<LeaseWithDetails[]> {
    return await this.leaseRepository.findByUserId(userId);
  }
}
