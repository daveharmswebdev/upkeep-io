import { LeaseLessee } from './LeaseLessee';

describe('LeaseLessee types', () => {
  describe('LeaseLessee interface', () => {
    it('should accept valid LeaseLessee object with required fields', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.id).toBe('123');
      expect(leaseLessee.leaseId).toBe('456');
      expect(leaseLessee.personId).toBe('789');
    });

    it('should accept LeaseLessee with optional signedDate', () => {
      const signedDate = new Date('2023-12-15');
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        signedDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.signedDate).toBeInstanceOf(Date);
      expect(leaseLessee.signedDate).toBe(signedDate);
    });

    it('should accept LeaseLessee without signedDate', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.signedDate).toBeUndefined();
    });

    it('should accept LeaseLessee with optional deletedAt', () => {
      const deletedAt = new Date('2024-06-01');
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        deletedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.deletedAt).toBeInstanceOf(Date);
      expect(leaseLessee.deletedAt).toBe(deletedAt);
    });

    it('should accept LeaseLessee without deletedAt', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.deletedAt).toBeUndefined();
    });

    it('should accept LeaseLessee with all optional fields', () => {
      const signedDate = new Date('2023-12-15');
      const deletedAt = new Date('2024-06-01');
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        signedDate,
        deletedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.signedDate).toBe(signedDate);
      expect(leaseLessee.deletedAt).toBe(deletedAt);
    });

    it('should have all required fields defined', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee).toHaveProperty('id');
      expect(leaseLessee).toHaveProperty('leaseId');
      expect(leaseLessee).toHaveProperty('personId');
      expect(leaseLessee).toHaveProperty('createdAt');
      expect(leaseLessee).toHaveProperty('updatedAt');
    });

    it('should support Date objects for timestamps', () => {
      const now = new Date();
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: now,
        updatedAt: now,
      };

      expect(leaseLessee.createdAt).toBeInstanceOf(Date);
      expect(leaseLessee.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle UUID format ids', () => {
      const leaseLessee: LeaseLessee = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        leaseId: '123e4567-e89b-12d3-a456-426614174001',
        personId: '123e4567-e89b-12d3-a456-426614174002',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseLessee.id).toMatch(/^[0-9a-f-]+$/i);
      expect(leaseLessee.leaseId).toMatch(/^[0-9a-f-]+$/i);
      expect(leaseLessee.personId).toMatch(/^[0-9a-f-]+$/i);
    });
  });

  describe('soft delete support', () => {
    it('should support soft delete pattern with deletedAt', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isDeleted = leaseLessee.deletedAt !== undefined && leaseLessee.deletedAt !== null;
      expect(isDeleted).toBe(true);
    });

    it('should identify non-deleted records', () => {
      const leaseLessee: LeaseLessee = {
        id: '123',
        leaseId: '456',
        personId: '789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isDeleted = leaseLessee.deletedAt !== undefined && leaseLessee.deletedAt !== null;
      expect(isDeleted).toBe(false);
    });
  });
});
