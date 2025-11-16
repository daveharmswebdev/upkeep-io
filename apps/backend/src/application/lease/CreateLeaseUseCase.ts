import { inject, injectable } from 'inversify';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { LeaseWithDetails } from '@upkeep-io/domain';
import { NotFoundError, ValidationError } from '@upkeep-io/domain';

export interface CreateLeaseInput {
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  depositPaidDate?: Date;
  notes?: string;
  lessees: Array<{
    personId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    signedDate?: Date;
  }>;
  occupants?: Array<{
    personId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    notes?: string;
    isAdult: boolean;
    moveInDate?: Date;
  }>;
}

@injectable()
export class CreateLeaseUseCase {
  constructor(
    @inject('ILeaseRepository') private leaseRepository: ILeaseRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository,
    @inject('IPersonRepository') private personRepository: IPersonRepository
  ) {}

  async execute(input: CreateLeaseInput): Promise<LeaseWithDetails> {
    // Verify property exists and belongs to user
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }
    if (property.userId !== input.userId) {
      throw new ValidationError('Property does not belong to this user');
    }

    // Check if property already has an active lease
    const activeLease = await this.leaseRepository.findActiveByPropertyId(input.propertyId);
    if (activeLease) {
      throw new ValidationError(
        'This property already has an active lease. Please end or void the existing lease before creating a new one.'
      );
    }

    // Process lessees - create persons if needed
    const lesseeData = await Promise.all(
      input.lessees.map(async (lessee) => {
        let personId = lessee.personId;

        // If personId not provided, create person inline
        if (!personId) {
          if (!lessee.firstName || !lessee.lastName || !lessee.email || !lessee.phone) {
            throw new ValidationError(
              'Lessee must have firstName, lastName, email, and phone for inline creation'
            );
          }

          const person = await this.personRepository.create({
            userId: input.userId,
            personType: 'LESSEE',
            firstName: lessee.firstName,
            lastName: lessee.lastName,
            middleName: lessee.middleName,
            email: lessee.email,
            phone: lessee.phone,
            notes: lessee.notes,
          });
          personId = person.id;
        } else {
          // Verify person exists and belongs to user
          const person = await this.personRepository.findById(personId);
          if (!person) {
            throw new NotFoundError(`Person ${personId} not found`);
          }
          if (person.userId !== input.userId) {
            throw new ValidationError('Person does not belong to this user');
          }
        }

        return {
          personId,
          signedDate: lessee.signedDate,
        };
      })
    );

    // Process occupants - create persons if needed
    const occupantData = input.occupants
      ? await Promise.all(
          input.occupants.map(async (occupant) => {
            let personId = occupant.personId;

            // If personId not provided, create person inline
            if (!personId) {
              if (!occupant.firstName || !occupant.lastName) {
                throw new ValidationError(
                  'Occupant must have firstName and lastName for inline creation'
                );
              }

              // Adult occupants MUST have email and phone
              if (occupant.isAdult && (!occupant.email || !occupant.phone)) {
                throw new ValidationError('Adult occupants must have email and phone');
              }

              const person = await this.personRepository.create({
                userId: input.userId,
                personType: 'OCCUPANT',
                firstName: occupant.firstName,
                lastName: occupant.lastName,
                middleName: occupant.middleName,
                email: occupant.email,
                phone: occupant.phone,
                notes: occupant.notes,
              });
              personId = person.id;
            } else {
              // Verify person exists and belongs to user
              const person = await this.personRepository.findById(personId);
              if (!person) {
                throw new NotFoundError(`Person ${personId} not found`);
              }
              if (person.userId !== input.userId) {
                throw new ValidationError('Person does not belong to this user');
              }
            }

            return {
              personId,
              isAdult: occupant.isAdult,
              moveInDate: occupant.moveInDate,
            };
          })
        )
      : undefined;

    // Create the lease
    const lease = await this.leaseRepository.create({
      userId: input.userId,
      propertyId: input.propertyId,
      startDate: input.startDate,
      endDate: input.endDate,
      monthlyRent: input.monthlyRent,
      securityDeposit: input.securityDeposit,
      depositPaidDate: input.depositPaidDate,
      notes: input.notes,
      lessees: lesseeData,
      occupants: occupantData,
    });

    return lease;
  }
}
