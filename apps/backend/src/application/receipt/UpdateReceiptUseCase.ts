import { injectable, inject } from 'inversify';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { ValidationError, NotFoundError } from '@domain/errors';
import { createReceiptSchema } from '@validators/receipt';
import { Receipt, ReceiptCategory } from '@domain/entities';

interface UpdateReceiptInput {
  userId: string;
  receiptId: string;
  amount?: number;
  category?: ReceiptCategory;
  storeName?: string;
  purchaseDate?: Date;
  description?: string;
  receiptImageUrl?: string;
}

@injectable()
export class UpdateReceiptUseCase {
  constructor(
    @inject('IReceiptRepository') private receiptRepository: IReceiptRepository
  ) {}

  async execute(input: UpdateReceiptInput): Promise<Receipt> {
    // Check receipt exists and user owns it
    const existingReceipt = await this.receiptRepository.findById(input.receiptId);

    if (!existingReceipt) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    if (existingReceipt.userId !== input.userId) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    // Merge existing data with updates for validation
    const updateData = {
      propertyId: existingReceipt.propertyId, // Cannot change propertyId
      amount: input.amount ?? existingReceipt.amount,
      category: input.category ?? existingReceipt.category,
      storeName: input.storeName ?? existingReceipt.storeName,
      purchaseDate: input.purchaseDate ?? existingReceipt.purchaseDate,
      description: input.description !== undefined ? input.description : existingReceipt.description,
      receiptImageUrl: input.receiptImageUrl !== undefined ? input.receiptImageUrl : existingReceipt.receiptImageUrl,
    };

    // Validate merged data
    const validation = createReceiptSchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Update receipt (excluding propertyId)
    const updatedReceipt = await this.receiptRepository.update(input.receiptId, {
      amount: updateData.amount,
      category: updateData.category,
      storeName: updateData.storeName,
      purchaseDate: updateData.purchaseDate,
      description: updateData.description,
      receiptImageUrl: updateData.receiptImageUrl,
    });

    if (!updatedReceipt) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    return updatedReceipt;
  }
}
