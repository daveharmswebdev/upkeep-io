import { Tenant, CreateTenantData } from '@domain/entities';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByUserId(userId: string): Promise<Tenant[]>;
  findByPropertyId(propertyId: string): Promise<Tenant[]>;
  create(data: CreateTenantData): Promise<Tenant>;
  update(id: string, data: Partial<Tenant>): Promise<Tenant>;
  softDelete(id: string): Promise<void>;
}
