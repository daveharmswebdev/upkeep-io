import { injectable, inject } from 'inversify';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Property } from '@domain/entities';

interface GetPropertyByIdInput {
  userId: string;
  propertyId: string;
}

@injectable()
export class GetPropertyByIdUseCase {
  constructor(
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: GetPropertyByIdInput): Promise<Property> {
    const property = await this.propertyRepository.findById(input.propertyId);

    if (!property) {
      throw new NotFoundError('Property', input.propertyId);
    }

    // Ensure user owns this property
    if (property.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    return property;
  }
}
