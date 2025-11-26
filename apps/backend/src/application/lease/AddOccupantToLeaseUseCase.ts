import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { NotFoundError, ValidationError, type LeaseWithDetails } from '@upkeep-io/domain';

export interface AddOccupantInput {
  personId?: string;
  isAdult: boolean;
  moveInDate?: Date;
  // Inline person creation fields
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

@injectable()
export class AddOccupantToLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository,
    @inject('IPersonRepository') private personRepository: IPersonRepository
  ) {}

  async execute(
    leaseId: string,
    userId: string,
    input: AddOccupantInput
  ): Promise<LeaseWithDetails> {
    // 1. Verify lease exists and belongs to user
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // 2. Process occupant - either verify existing person or create inline
    let occupantPersonId = input.personId;

    if (occupantPersonId) {
      // Verify existing person
      const person = await this.personRepository.findById(occupantPersonId);

      if (!person) {
        throw new NotFoundError('Person', occupantPersonId);
      }

      if (person.userId !== userId) {
        throw new ValidationError('Person does not belong to this user');
      }

      // Validate adult occupants have email and phone
      if (input.isAdult && (!person.email || !person.phone)) {
        throw new ValidationError('Adult occupants must have email and phone');
      }
    } else {
      // Create person inline
      if (!input.firstName || !input.lastName) {
        throw new ValidationError(
          'Occupant must have firstName and lastName for inline creation'
        );
      }

      // For adult occupants, email and phone are required
      if (input.isAdult && (!input.email || !input.phone)) {
        throw new ValidationError(
          'Adult occupants require email and phone for inline creation'
        );
      }

      const person = await this.personRepository.create({
        userId,
        personType: 'OCCUPANT',
        firstName: input.firstName,
        lastName: input.lastName,
        middleName: input.middleName,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
      });
      occupantPersonId = person.id;
    }

    // 3. Add occupant to lease
    await this.leaseRepository.addOccupant({
      leaseId,
      personId: occupantPersonId,
      isAdult: input.isAdult,
      moveInDate: input.moveInDate,
    });

    // 4. Return updated lease with details
    const updatedLease = await this.leaseRepository.findById(leaseId);

    if (!updatedLease) {
      throw new NotFoundError('Lease', leaseId);
    }

    return updatedLease;
  }
}
