import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { NotFoundError, ValidationError } from '@domain/errors';

export interface RemoveLesseeInput {
  voidedReason: string;
  newLeaseData: {
    startDate: Date;
    endDate?: Date;
    monthlyRent?: number;
    securityDeposit?: number;
    depositPaidDate?: Date;
    notes?: string;
  };
}

@injectable()
export class RemoveLesseeFromLeaseUseCase {
  constructor(@inject('ILeaseRepository') private leaseRepository: ILeaseRepository) {}

  async execute(
    leaseId: string,
    personIdToRemove: string,
    userId: string,
    input: RemoveLesseeInput
  ): Promise<string> {
    const lease = await this.leaseRepository.findById(leaseId);

    if (!lease) {
      throw new NotFoundError('Lease', leaseId);
    }

    if (lease.userId !== userId) {
      throw new ValidationError('Lease does not belong to this user');
    }

    // Void the old lease
    await this.leaseRepository.voidLease(leaseId, input.voidedReason);

    // Get remaining lessees (excluding the one to remove)
    const remainingLessees = lease.lessees.filter((lessee) => lessee.personId !== personIdToRemove);

    if (remainingLessees.length === 0) {
      throw new ValidationError('Cannot remove last lessee. Delete the lease instead.');
    }

    // Create new lease with remaining lessees
    const newLease = await this.leaseRepository.create({
      userId: lease.userId,
      propertyId: lease.propertyId,
      startDate: input.newLeaseData.startDate,
      endDate: input.newLeaseData.endDate,
      monthlyRent: input.newLeaseData.monthlyRent,
      securityDeposit: input.newLeaseData.securityDeposit,
      depositPaidDate: input.newLeaseData.depositPaidDate,
      notes: input.newLeaseData.notes,
      lessees: remainingLessees.map((lessee) => ({
        personId: lessee.personId,
        signedDate: lessee.signedDate,
      })),
      occupants: lease.occupants?.map((occupant) => ({
        personId: occupant.personId,
        isAdult: occupant.isAdult,
        moveInDate: occupant.moveInDate,
      })),
    });

    return newLease.id;
  }
}
