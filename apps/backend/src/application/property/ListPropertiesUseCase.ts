import { injectable, inject } from 'inversify';
import { IPropertyRepository } from '../../domain/repositories';
import { Property } from '@domain/entities';

interface ListPropertiesInput {
  userId: string;
}

@injectable()
export class ListPropertiesUseCase {
  constructor(
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: ListPropertiesInput): Promise<Property[]> {
    const properties = await this.propertyRepository.findByUserId(input.userId);
    return properties;
  }
}
