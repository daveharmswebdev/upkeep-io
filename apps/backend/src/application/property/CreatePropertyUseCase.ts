import { injectable, inject } from 'inversify';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError } from '@domain/errors';
import { createPropertySchema } from '@validators/property';
import { Property } from '@domain/entities';

interface CreatePropertyInput {
  userId: string;
  street: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  nickname?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}

@injectable()
export class CreatePropertyUseCase {
  constructor(
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: CreatePropertyInput): Promise<Property> {
    // Validate input
    const validation = createPropertySchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Create property
    const property = await this.propertyRepository.create({
      userId: input.userId,
      street: input.street,
      address2: input.address2,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      nickname: input.nickname,
      purchaseDate: input.purchaseDate,
      purchasePrice: input.purchasePrice,
    });

    return property;
  }
}
