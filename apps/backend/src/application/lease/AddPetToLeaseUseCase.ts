import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import type { LeaseWithDetails } from '@domain/entities';

export interface AddPetInput {
  name: string;
  species: 'cat' | 'dog';
  notes?: string;
}

@injectable()
export class AddPetToLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository
  ) {}

  async execute(
    leaseId: string,
    userId: string,
    input: AddPetInput
  ): Promise<LeaseWithDetails> {
    // 1. Verify lease exists and belongs to user
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // 2. Add pet to lease
    await this.leaseRepository.addPet({
      leaseId,
      name: input.name,
      species: input.species,
      notes: input.notes,
    });

    // 3. Return updated lease with details
    const updatedLease = await this.leaseRepository.findById(leaseId);

    if (!updatedLease) {
      throw new NotFoundError('Lease', leaseId);
    }

    return updatedLease;
  }
}
