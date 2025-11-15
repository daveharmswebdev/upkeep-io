import { injectable, inject } from 'inversify';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';

interface DeletePropertyInput {
  userId: string;
  propertyId: string;
}

@injectable()
export class DeletePropertyUseCase {
  constructor(
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: DeletePropertyInput): Promise<void> {
    // Check property exists and user owns it
    const existingProperty = await this.propertyRepository.findById(input.propertyId);

    if (!existingProperty) {
      throw new NotFoundError('Property', input.propertyId);
    }

    if (existingProperty.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    // Delete property
    await this.propertyRepository.delete(input.propertyId);
  }
}
