import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant, CreateTenantData } from '@domain/entities';

@injectable()
export class PrismaTenantRepository implements ITenantRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id,
        deletedAt: null, // Exclude soft-deleted
      },
    });

    if (!tenant) return null;

    return this.mapTenantToDomain(tenant);
  }

  async findByUserId(userId: string): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        userId,
        deletedAt: null, // Exclude soft-deleted
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map(t => this.mapTenantToDomain(t));
  }

  async findByPropertyId(propertyId: string): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        propertyId,
        deletedAt: null, // Exclude soft-deleted
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map(t => this.mapTenantToDomain(t));
  }

  async create(data: CreateTenantData): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({
      data: {
        userId: data.userId,
        personId: data.personId,
        propertyId: data.propertyId,
        leaseStartDate: data.leaseStartDate,
        leaseEndDate: data.leaseEndDate,
        monthlyRent: data.monthlyRent,
        securityDeposit: data.securityDeposit,
        notes: data.notes,
      },
    });

    return this.mapTenantToDomain(tenant);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    // First check if tenant exists and is not soft-deleted
    const existing = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt !== null) {
      throw new Error('Tenant not found');
    }

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...data,
        // Ensure we don't accidentally set deletedAt through update
        deletedAt: undefined,
      },
    });

    return this.mapTenantToDomain(tenant);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private mapTenantToDomain(tenant: any): Tenant {
    return {
      ...tenant,
      leaseEndDate: tenant.leaseEndDate ?? undefined,
      monthlyRent: tenant.monthlyRent ? tenant.monthlyRent.toNumber() : undefined,
      securityDeposit: tenant.securityDeposit ? tenant.securityDeposit.toNumber() : undefined,
      notes: tenant.notes ?? undefined,
      deletedAt: tenant.deletedAt ?? undefined,
    };
  }
}
