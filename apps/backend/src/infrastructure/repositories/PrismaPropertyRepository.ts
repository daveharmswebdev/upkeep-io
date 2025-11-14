import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IPropertyRepository } from '../../domain/repositories';
import { Property, CreatePropertyData } from '@domain/entities';

@injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) return null;

    return {
      ...property,
      purchasePrice: property.purchasePrice ? property.purchasePrice.toNumber() : undefined,
    };
  }

  async findByUserId(userId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map(p => ({
      ...p,
      purchasePrice: p.purchasePrice ? p.purchasePrice.toNumber() : undefined,
    }));
  }

  async create(data: CreatePropertyData): Promise<Property> {
    const property = await this.prisma.property.create({
      data: {
        userId: data.userId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        nickname: data.nickname,
        purchaseDate: data.purchaseDate,
        purchasePrice: data.purchasePrice,
      },
    });

    return {
      ...property,
      purchasePrice: property.purchasePrice ? property.purchasePrice.toNumber() : undefined,
    };
  }

  async update(id: string, data: Partial<Property>): Promise<Property> {
    const property = await this.prisma.property.update({
      where: { id },
      data,
    });

    return {
      ...property,
      purchasePrice: property.purchasePrice ? property.purchasePrice.toNumber() : undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({
      where: { id },
    });
  }
}
