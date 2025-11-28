import { injectable, inject } from 'inversify';
import { IReceiptRepository, PaginationParams } from '../../domain/repositories/IReceiptRepository';
import { IPropertyRepository } from '../../domain/repositories';
import { NotFoundError } from '@domain/errors';
import { Receipt } from '@domain/entities';

interface ListReceiptsInput {
  userId: string;
  propertyId?: string;
  pagination?: PaginationParams;
}

interface ListReceiptsOutput {
  receipts: Receipt[];
  total: number;
  ytdExpenses: number;
}

@injectable()
export class ListReceiptsUseCase {
  constructor(
    @inject('IReceiptRepository') private receiptRepository: IReceiptRepository,
    @inject('IPropertyRepository') private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: ListReceiptsInput): Promise<ListReceiptsOutput> {
    // If filtering by property, verify user owns it
    if (input.propertyId) {
      const property = await this.propertyRepository.findById(input.propertyId);

      if (!property) {
        throw new NotFoundError('Property', input.propertyId);
      }

      if (property.userId !== input.userId) {
        throw new NotFoundError('Property', input.propertyId);
      }

      // Get receipts for this property
      const { receipts, total } = await this.receiptRepository.findByPropertyId(
        input.propertyId,
        input.pagination
      );

      // Get YTD expenses for this property
      const currentYear = new Date().getFullYear();
      const ytdExpenses = await this.receiptRepository.getTotalExpensesByPropertyForYear(
        input.propertyId,
        currentYear
      );

      return { receipts, total, ytdExpenses };
    }

    // Otherwise, get all receipts for user
    const { receipts, total } = await this.receiptRepository.findByUserId(
      input.userId,
      input.pagination
    );

    // Get YTD expenses for user
    const currentYear = new Date().getFullYear();
    const ytdExpenses = await this.receiptRepository.getTotalExpensesByUserForYear(
      input.userId,
      currentYear
    );

    return { receipts, total, ytdExpenses };
  }
}
