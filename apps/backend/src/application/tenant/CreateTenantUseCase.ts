import { injectable, inject } from 'inversify';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError, NotFoundError } from '@domain/errors';
import { createTenantSchema } from '@validators/tenant';
import { Tenant } from '@domain/entities';

export interface CreateTenantInput {
  userId: string;
  // Person fields
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  personNotes?: string;
  // Tenant fields
  propertyId: string;
  leaseStartDate: Date;
  leaseEndDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  tenantNotes?: string;
}

@injectable()
export class CreateTenantUseCase {
  constructor(
    @inject('IPersonRepository') private personRepository: IPersonRepository,
    @inject('ITenantRepository') private tenantRepository: ITenantRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: CreateTenantInput): Promise<Tenant> {
    // Validate input
    const validation = createTenantSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Verify property exists and belongs to user
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new NotFoundError('Property', input.propertyId);
    }
    if (property.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    // Create person first
    const person = await this.personRepository.create({
      userId: input.userId,
      personType: 'OWNER', // Default to OWNER for tenant persons
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName,
      email: input.email,
      phone: input.phone,
      notes: input.personNotes,
    });

    try {
      // Create tenant with person reference
      const tenant = await this.tenantRepository.create({
        userId: input.userId,
        personId: person.id,
        propertyId: input.propertyId,
        leaseStartDate: input.leaseStartDate,
        leaseEndDate: input.leaseEndDate,
        monthlyRent: input.monthlyRent,
        securityDeposit: input.securityDeposit,
        notes: input.tenantNotes,
      });

      return tenant;
    } catch (error) {
      // If tenant creation fails, clean up the person
      await this.personRepository.delete(person.id);
      throw error;
    }
  }
}
