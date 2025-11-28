import { Receipt, CreateReceiptData, UpdateReceiptData } from '@domain/entities';

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedReceipts {
  receipts: Receipt[];
  total: number;
}

export interface IReceiptRepository {
  findById(id: string): Promise<Receipt | null>;
  create(data: CreateReceiptData): Promise<Receipt>;
  update(id: string, data: UpdateReceiptData): Promise<Receipt>;
  delete(id: string): Promise<void>;
  findByPropertyId(propertyId: string, pagination?: PaginationParams): Promise<PaginatedReceipts>;
  findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedReceipts>;
  getTotalExpensesByPropertyForYear(propertyId: string, year: number): Promise<number>;
  getTotalExpensesByUserForYear(userId: string, year: number): Promise<number>;
}
