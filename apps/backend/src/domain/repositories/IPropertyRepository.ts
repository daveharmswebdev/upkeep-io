import { Property, CreatePropertyData } from '@domain/entities';

export interface IPropertyRepository {
  findById(id: string): Promise<Property | null>;
  findByUserId(userId: string): Promise<Property[]>;
  create(data: CreatePropertyData): Promise<Property>;
  update(id: string, data: Partial<Property>): Promise<Property>;
  delete(id: string): Promise<void>;
}
