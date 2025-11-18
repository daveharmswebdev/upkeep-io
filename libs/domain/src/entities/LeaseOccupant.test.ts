import { LeaseOccupant } from './LeaseOccupant';

describe('LeaseOccupant types', () => {
  describe('LeaseOccupant interface', () => {
    it('should accept valid LeaseOccupant object with required fields', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.id).toBe('123');
      expect(leaseOccupant.leaseId).toBe('456');
      expect(leaseOccupant.personId).toBe('789');
      expect(leaseOccupant.isAdult).toBe(true);
    });

    it('should accept LeaseOccupant with isAdult false', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.isAdult).toBe(false);
    });

    it('should accept LeaseOccupant with optional moveInDate', () => {
      const moveInDate = new Date('2024-01-01');
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        moveInDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.moveInDate).toBeInstanceOf(Date);
      expect(leaseOccupant.moveInDate).toBe(moveInDate);
    });

    it('should accept LeaseOccupant without moveInDate', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.moveInDate).toBeUndefined();
    });

    it('should accept LeaseOccupant with optional moveOutDate', () => {
      const moveOutDate = new Date('2024-06-01');
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        moveOutDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.moveOutDate).toBeInstanceOf(Date);
      expect(leaseOccupant.moveOutDate).toBe(moveOutDate);
    });

    it('should accept LeaseOccupant without moveOutDate', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.moveOutDate).toBeUndefined();
    });

    it('should accept LeaseOccupant with optional deletedAt', () => {
      const deletedAt = new Date('2024-06-01');
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        deletedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.deletedAt).toBeInstanceOf(Date);
      expect(leaseOccupant.deletedAt).toBe(deletedAt);
    });

    it('should accept LeaseOccupant without deletedAt', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.deletedAt).toBeUndefined();
    });

    it('should accept LeaseOccupant with all optional fields', () => {
      const moveInDate = new Date('2024-01-01');
      const moveOutDate = new Date('2024-06-01');
      const deletedAt = new Date('2024-07-01');
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        moveInDate,
        moveOutDate,
        deletedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.moveInDate).toBe(moveInDate);
      expect(leaseOccupant.moveOutDate).toBe(moveOutDate);
      expect(leaseOccupant.deletedAt).toBe(deletedAt);
    });

    it('should have all required fields defined', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant).toHaveProperty('id');
      expect(leaseOccupant).toHaveProperty('leaseId');
      expect(leaseOccupant).toHaveProperty('personId');
      expect(leaseOccupant).toHaveProperty('isAdult');
      expect(leaseOccupant).toHaveProperty('createdAt');
      expect(leaseOccupant).toHaveProperty('updatedAt');
    });

    it('should support Date objects for timestamps', () => {
      const now = new Date();
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: now,
        updatedAt: now,
      };

      expect(leaseOccupant.createdAt).toBeInstanceOf(Date);
      expect(leaseOccupant.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle UUID format ids', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        leaseId: '123e4567-e89b-12d3-a456-426614174001',
        personId: '123e4567-e89b-12d3-a456-426614174002',
        isAdult: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(leaseOccupant.id).toMatch(/^[0-9a-f-]+$/i);
      expect(leaseOccupant.leaseId).toMatch(/^[0-9a-f-]+$/i);
      expect(leaseOccupant.personId).toMatch(/^[0-9a-f-]+$/i);
    });
  });

  describe('soft delete support', () => {
    it('should support soft delete pattern with deletedAt', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isDeleted = leaseOccupant.deletedAt !== undefined && leaseOccupant.deletedAt !== null;
      expect(isDeleted).toBe(true);
    });

    it('should identify non-deleted records', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isDeleted = leaseOccupant.deletedAt !== undefined && leaseOccupant.deletedAt !== null;
      expect(isDeleted).toBe(false);
    });
  });

  describe('occupancy tracking', () => {
    it('should track move in and move out dates', () => {
      const moveInDate = new Date('2024-01-01');
      const moveOutDate = new Date('2024-12-31');
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        moveInDate,
        moveOutDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isCurrentlyOccupied = leaseOccupant.moveInDate && !leaseOccupant.moveOutDate;
      expect(isCurrentlyOccupied).toBe(false); // Has moved out
    });

    it('should identify current occupants', () => {
      const leaseOccupant: LeaseOccupant = {
        id: '123',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        moveInDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const isCurrentlyOccupied = leaseOccupant.moveInDate && !leaseOccupant.moveOutDate;
      expect(isCurrentlyOccupied).toBe(true); // Currently occupied
    });

    it('should distinguish adult vs child occupants', () => {
      const adult: LeaseOccupant = {
        id: '1',
        leaseId: '456',
        personId: '789',
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const child: LeaseOccupant = {
        id: '2',
        leaseId: '456',
        personId: '790',
        isAdult: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(adult.isAdult).toBe(true);
      expect(child.isAdult).toBe(false);
    });
  });
});
