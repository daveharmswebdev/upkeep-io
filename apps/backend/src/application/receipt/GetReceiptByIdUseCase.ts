import { injectable, inject } from 'inversify';
import { IReceiptRepository } from '../../domain/repositories/IReceiptRepository';
import { NotFoundError } from '@domain/errors';
import { Receipt } from '@domain/entities';

interface GetReceiptByIdInput {
  userId: string;
  receiptId: string;
}

@injectable()
export class GetReceiptByIdUseCase {
  constructor(
    @inject('IReceiptRepository') private receiptRepository: IReceiptRepository
  ) {}

  async execute(input: GetReceiptByIdInput): Promise<Receipt> {
    const receipt = await this.receiptRepository.findById(input.receiptId);

    if (!receipt) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    // Security: Return NotFoundError if user doesn't own the receipt
    if (receipt.userId !== input.userId) {
      throw new NotFoundError('Receipt', input.receiptId);
    }

    return receipt;
  }
}
