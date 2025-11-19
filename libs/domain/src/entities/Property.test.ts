import { Property, CreatePropertyData } from './Property';

describe('Property types', () => {
  describe('Property interface', () => {
    it('should accept valid Property object', () => {
      const property: Property = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(property.id).toBeDefined();
      expect(property.userId).toBeDefined();
      expect(property.street).toBeDefined();
    });

    it('should accept Property with optional fields', () => {
      const property: Property = {
        id: '123',
        userId: '456',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        nickname: 'Downtown Apartment',
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 500000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(property.nickname).toBe('Downtown Apartment');
      expect(property.purchaseDate).toBeInstanceOf(Date);
      expect(property.purchasePrice).toBe(500000);
    });

    it('should work with optional fields as undefined', () => {
      const property: Property = {
        id: '123',
        userId: '456',
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        nickname: undefined,
        purchaseDate: undefined,
        purchasePrice: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(property.nickname).toBeUndefined();
      expect(property.purchaseDate).toBeUndefined();
      expect(property.purchasePrice).toBeUndefined();
    });

    it('should have all required fields defined', () => {
      const property: Property = {
        id: '123',
        userId: '456',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(property).toHaveProperty('id');
      expect(property).toHaveProperty('userId');
      expect(property).toHaveProperty('street');
      expect(property).toHaveProperty('city');
      expect(property).toHaveProperty('state');
      expect(property).toHaveProperty('zipCode');
      expect(property).toHaveProperty('createdAt');
      expect(property).toHaveProperty('updatedAt');
    });
  });

  describe('CreatePropertyData interface', () => {
    it('should accept valid CreatePropertyData object', () => {
      const data: CreatePropertyData = {
        userId: '123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(data.userId).toBe('123');
      expect(data.street).toBe('123 Main St');
    });

    it('should accept CreatePropertyData with optional fields', () => {
      const data: CreatePropertyData = {
        userId: '123',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        nickname: 'My Property',
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 500000,
      };

      expect(data.nickname).toBe('My Property');
      expect(data.purchaseDate).toBeInstanceOf(Date);
      expect(data.purchasePrice).toBe(500000);
    });

    it('should work without optional fields', () => {
      const data: CreatePropertyData = {
        userId: '123',
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
      };

      expect(data).not.toHaveProperty('nickname');
      expect(data).not.toHaveProperty('purchaseDate');
      expect(data).not.toHaveProperty('purchasePrice');
    });

    it('should not have id, createdAt, or updatedAt fields', () => {
      const data: CreatePropertyData = {
        userId: '123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };

      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('createdAt');
      expect(data).not.toHaveProperty('updatedAt');
    });
  });

  describe('type compatibility', () => {
    it('should allow assigning CreatePropertyData fields to Property', () => {
      const createData: CreatePropertyData = {
        userId: '123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        nickname: 'Test Property',
      };

      const property: Property = {
        ...createData,
        id: '456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(property.userId).toBe(createData.userId);
      expect(property.street).toBe(createData.street);
      expect(property.nickname).toBe(createData.nickname);
    });
  });
});
