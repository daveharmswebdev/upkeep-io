import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { type LeaseWithDetails } from '@domain/entities';
import { NotFoundError, ValidationError } from '@domain/errors';

@injectable()
export class RemovePetFromLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository
  ) {}

  async execute(
    leaseId: string,
    userId: string,
    petId: string
  ): Promise<LeaseWithDetails> {
    // 1. Verify lease exists and belongs to user
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // 2. Verify pet exists on the lease
    const petExists = lease.pets.some(pet => pet.id === petId);
    if (!petExists) {
      throw new NotFoundError('Pet', petId);
    }

    // 3. Remove pet from lease
    await this.leaseRepository.removePet(leaseId, petId);

    // 4. Return updated lease with details
    const updatedLease = await this.leaseRepository.findById(leaseId);

    if (!updatedLease) {
      throw new NotFoundError('Lease', leaseId);
    }

    return updatedLease;
  }
}
