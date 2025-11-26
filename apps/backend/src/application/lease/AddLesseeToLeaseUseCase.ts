import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { NotFoundError, ValidationError } from '@domain/errors';

export interface AddLesseeInput {
  voidedReason: string;
  newLessee: {
    personId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    signedDate?: Date;
  };
  newLeaseData: {
    startDate: Date;
    endDate?: Date;
    monthlyRent?: number;
    securityDeposit?: number;
    depositPaidDate?: Date;
  };
}

@injectable()
export class AddLesseeToLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository,
    @inject('IPersonRepository') private personRepository: IPersonRepository
  ) {}

  async execute(leaseId: string, userId: string, input: AddLesseeInput): Promise<string> {
    // 1. Verify lease exists and belongs to user
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // 2. Process new lessee - either verify existing person or create inline
    let newLesseePersonId = input.newLessee.personId;

    if (newLesseePersonId) {
      // Verify existing person
      const person = await this.personRepository.findById(newLesseePersonId);

      if (!person) {
        throw new NotFoundError('Person', newLesseePersonId);
      }

      if (person.userId !== userId) {
        throw new ValidationError('Person does not belong to this user');
      }
    } else {
      // Create person inline
      if (!input.newLessee.firstName || !input.newLessee.lastName || !input.newLessee.email || !input.newLessee.phone) {
        throw new ValidationError(
          'Lessee must have firstName, lastName, email, and phone for inline creation'
        );
      }

      const person = await this.personRepository.create({
        userId,
        personType: 'LESSEE',
        firstName: input.newLessee.firstName,
        lastName: input.newLessee.lastName,
        middleName: input.newLessee.middleName,
        email: input.newLessee.email,
        phone: input.newLessee.phone,
      });
      newLesseePersonId = person.id;
    }

    // 3. Check for duplicate lessee
    const isAlreadyLessee = lease.lessees.some((lessee) => lessee.personId === newLesseePersonId);
    if (isAlreadyLessee) {
      throw new ValidationError('This person is already a lessee on this lease');
    }

    // 4. Void the old lease
    await this.leaseRepository.voidLease(leaseId, input.voidedReason);

    // 5. Create new lease with all existing lessees + new lessee + all occupants
    const newLease = await this.leaseRepository.create({
      userId: lease.userId,
      propertyId: lease.propertyId,
      startDate: input.newLeaseData.startDate,
      endDate: input.newLeaseData.endDate,
      monthlyRent: input.newLeaseData.monthlyRent,
      securityDeposit: input.newLeaseData.securityDeposit,
      depositPaidDate: input.newLeaseData.depositPaidDate,
      lessees: [
        ...lease.lessees.map((lessee) => ({
          personId: lessee.personId,
          signedDate: lessee.signedDate,
        })),
        {
          personId: newLesseePersonId,
          signedDate: input.newLessee.signedDate,
        },
      ],
      occupants: lease.occupants?.map((occupant) => ({
        personId: occupant.personId,
        isAdult: occupant.isAdult,
        moveInDate: occupant.moveInDate,
      })),
    });

    // 6. Return new lease ID
    return newLease.id;
  }
}
