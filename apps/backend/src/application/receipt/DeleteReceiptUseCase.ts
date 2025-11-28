import { injectable, inject } from 'inversify';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { NotFoundError } from '@domain/errors';

interface DeleteReceiptInput {
  userId: string;
  receiptId: string;
}

@injectable()
export class DeleteReceiptUseCase {
  constructor(
    @inject('IReceiptRepository') private receiptRepository: IReceiptRepository
  ) {}

  async execute(input: DeleteReceiptInput): Promise<void> {
    // Check receipt exists and user owns it
    const receipt = await this.receiptRepository.findById(input.receiptId);

    if (!receipt) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    if (receipt.userId !== input.userId) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    // Delete receipt
    await this.receiptRepository.delete(input.receiptId);
  }
}
