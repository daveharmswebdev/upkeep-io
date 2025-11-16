import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { NotFoundError, ValidationError } from '@upkeep-io/domain';

@injectable()
export class AddOccupantToLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository,
    @inject('IPersonRepository') private personRepository: IPersonRepository
  ) {}

  async execute(
    leaseId: string,
    personId: string,
    isAdult: boolean,
    userId: string,
    moveInDate?: Date
  ): Promise<void> {
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    const person = await this.personRepository.findById(personId);

    if (!person) {
      throw new NotFoundError('Person not found');
    }

    if (person.userId !== userId) {
      throw new ValidationError('Person does not belong to this user');
    }

    // Validate adult occupants have email and phone
    if (isAdult && (!person.email || !person.phone)) {
      throw new ValidationError('Adult occupants must have email and phone');
    }

    await this.leaseRepository.addOccupant({
      leaseId,
      personId,
      isAdult,
      moveInDate,
    });
  }
}
