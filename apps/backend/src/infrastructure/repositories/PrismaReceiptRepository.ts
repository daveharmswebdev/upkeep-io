import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IReceiptRepository, PaginationParams, PaginatedReceipts } from '../../domain/repositories/IReceiptRepository';
import { Receipt, CreateReceiptData, UpdateReceiptData, ReceiptCategory } from '@domain/entities';

@injectable()
export class PrismaReceiptRepository implements IReceiptRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<Receipt | null> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
    });

    if (!receipt) return null;

    return {
      ...receipt,
      amount: receipt.amount.toNumber(),
      category: receipt.category as ReceiptCategory,
      description: receipt.description ?? undefined,
      receiptImageUrl: receipt.receiptImageUrl ?? undefined,
    };
  }

  async create(data: CreateReceiptData): Promise<Receipt> {
    const receipt = await this.prisma.receipt.create({
      data: {
        propertyId: data.propertyId,
        userId: data.userId,
        amount: data.amount,
        category: data.category,
        storeName: data.storeName,
        purchaseDate: data.purchaseDate,
        description: data.description,
        receiptImageUrl: data.receiptImageUrl,
      },
    });

    return {
      ...receipt,
      amount: receipt.amount.toNumber(),
      category: receipt.category as ReceiptCategory,
      description: receipt.description ?? undefined,
      receiptImageUrl: receipt.receiptImageUrl ?? undefined,
    };
  }

  async update(id: string, data: UpdateReceiptData): Promise<Receipt> {
    const receipt = await this.prisma.receipt.update({
      where: { id },
      data,
    });

    return {
      ...receipt,
      amount: receipt.amount.toNumber(),
      category: receipt.category as ReceiptCategory,
      description: receipt.description ?? undefined,
      receiptImageUrl: receipt.receiptImageUrl ?? undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.receipt.delete({
      where: { id },
    });
  }

  async findByPropertyId(propertyId: string, pagination?: PaginationParams): Promise<PaginatedReceipts> {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 20;

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where: { propertyId },
        orderBy: { purchaseDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.receipt.count({
        where: { propertyId },
      }),
    ]);

    return {
      receipts: receipts.map((r: any) => ({
        ...r,
        amount: r.amount.toNumber(),
        category: r.category as ReceiptCategory,
        description: r.description ?? undefined,
        receiptImageUrl: r.receiptImageUrl ?? undefined,
      })),
      total,
    };
  }

  async findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedReceipts> {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 20;

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where: { userId },
        orderBy: { purchaseDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.receipt.count({
        where: { userId },
      }),
    ]);

    return {
      receipts: receipts.map((r: any) => ({
        ...r,
        amount: r.amount.toNumber(),
        category: r.category as ReceiptCategory,
        description: r.description ?? undefined,
        receiptImageUrl: r.receiptImageUrl ?? undefined,
      })),
      total,
    };
  }

  async getTotalExpensesByPropertyForYear(propertyId: string, year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const result = await this.prisma.receipt.aggregate({
      where: {
        propertyId,
        purchaseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() ?? 0;
  }

  async getTotalExpensesByUserForYear(userId: string, year: number): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const result = await this.prisma.receipt.aggregate({
      where: {
        userId,
        purchaseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() ?? 0;
  }
}
