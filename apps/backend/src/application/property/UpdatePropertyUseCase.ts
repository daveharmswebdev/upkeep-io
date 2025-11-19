import { injectable, inject } from 'inversify';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError, NotFoundError } from '@domain/errors';
import { createPropertySchema } from '@validators/property';
import { Property } from '@domain/entities';

interface UpdatePropertyInput {
  userId: string;
  propertyId: string;
  street?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  nickname?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}

@injectable()
export class UpdatePropertyUseCase {
  constructor(
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: UpdatePropertyInput): Promise<Property> {
    // Check property exists and user owns it
    const existingProperty = await this.propertyRepository.findById(input.propertyId);

    if (!existingProperty) {
      throw new NotFoundError('Property', input.propertyId);
    }

    if (existingProperty.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    // Merge existing data with updates for validation
    const updateData = {
      street: input.street ?? existingProperty.street,
      address2: input.address2 !== undefined ? input.address2 : existingProperty.address2,
      city: input.city ?? existingProperty.city,
      state: input.state ?? existingProperty.state,
      zipCode: input.zipCode ?? existingProperty.zipCode,
      nickname: input.nickname !== undefined ? input.nickname : existingProperty.nickname,
      purchaseDate: input.purchaseDate !== undefined ? input.purchaseDate : existingProperty.purchaseDate,
      purchasePrice: input.purchasePrice !== undefined ? input.purchasePrice : existingProperty.purchasePrice,
    };

    // Validate merged data
    const validation = createPropertySchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Update property
    const updatedProperty = await this.propertyRepository.update(input.propertyId, updateData);

    if (!updatedProperty) {
      throw new NotFoundError('Property', input.propertyId);
    }

    return updatedProperty;
  }
}
