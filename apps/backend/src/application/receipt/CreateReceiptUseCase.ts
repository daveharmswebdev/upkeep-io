import { injectable, inject } from 'inversify';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { ValidationError, NotFoundError } from '@domain/errors';
import { createReceiptSchema } from '@validators/receipt';
import { Receipt } from '@domain/entities';

interface CreateReceiptInput {
  userId: string;
  propertyId: string;
  amount: number;
  category: string;
  storeName: string;
  purchaseDate: Date;
  description?: string;
  receiptImageUrl?: string;
}

@injectable()
export class CreateReceiptUseCase {
  constructor(
    @inject('IReceiptRepository') private receiptRepository: IReceiptRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: CreateReceiptInput): Promise<Receipt> {
    // Validate input
    const validation = createReceiptSchema.safeParse({
      propertyId: input.propertyId,
      amount: input.amount,
      category: input.category,
      storeName: input.storeName,
      purchaseDate: input.purchaseDate,
      description: input.description,
      receiptImageUrl: input.receiptImageUrl,
    });

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Verify property exists and user owns it
    const property = await this.propertyRepository.findById(input.propertyId);

    if (!property) {
      throw new NotFoundError('Property', input.propertyId);
    }

    if (property.userId !== input.userId) {
      throw new NotFoundError('Property', input.propertyId);
    }

    // Create receipt
    const receipt = await this.receiptRepository.create({
      userId: input.userId,
      propertyId: input.propertyId,
      amount: input.amount,
      category: validation.data.category,
      storeName: input.storeName,
      purchaseDate: input.purchaseDate,
      description: input.description,
      receiptImageUrl: input.receiptImageUrl,
    });

    return receipt;
  }
}
