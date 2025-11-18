import { Lease, LeaseStatus, LeaseWithDetails } from './Lease';

describe('Lease types', () => {
  describe('LeaseStatus enum', () => {
    it('should have ACTIVE status', () => {
      expect(LeaseStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have MONTH_TO_MONTH status', () => {
      expect(LeaseStatus.MONTH_TO_MONTH).toBe('MONTH_TO_MONTH');
    });

    it('should have ENDED status', () => {
      expect(LeaseStatus.ENDED).toBe('ENDED');
    });

    it('should have VOIDED status', () => {
      expect(LeaseStatus.VOIDED).toBe('VOIDED');
    });

    it('should be usable as type guard', () => {
      const status: LeaseStatus = LeaseStatus.ACTIVE;
      expect(Object.values(LeaseStatus)).toContain(status);
    });
  });

  describe('Lease interface', () => {
    it('should accept valid Lease object with required fields', () => {
      const lease: Lease = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(lease.id).toBe('123');
      expect(lease.userId).toBe('456');
      expect(lease.propertyId).toBe('789');
      expect(lease.status).toBe(LeaseStatus.ACTIVE);
    });

    it('should accept Lease with all optional fields', () => {
      const lease: Lease = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyRent: 2000,
        securityDeposit: 4000,
        depositPaidDate: new Date('2024-01-01'),
        notes: 'Standard lease agreement',
        status: LeaseStatus.ACTIVE,
        voidedReason: undefined,
        deletedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(lease.endDate).toBeInstanceOf(Date);
      expect(lease.monthlyRent).toBe(2000);
      expect(lease.securityDeposit).toBe(4000);
      expect(lease.notes).toBe('Standard lease agreement');
    });

    it('should accept Lease with VOIDED status and reason', () => {
      const lease: Lease = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.VOIDED,
        voidedReason: 'Tenant broke lease early',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(lease.status).toBe(LeaseStatus.VOIDED);
      expect(lease.voidedReason).toBe('Tenant broke lease early');
    });

    it('should accept Lease with deletedAt timestamp', () => {
      const deletedAt = new Date('2024-06-01');
      const lease: Lease = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ENDED,
        deletedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(lease.deletedAt).toBeInstanceOf(Date);
      expect(lease.deletedAt).toBe(deletedAt);
    });

    it('should accept all LeaseStatus values', () => {
      const statuses = [
        LeaseStatus.ACTIVE,
        LeaseStatus.MONTH_TO_MONTH,
        LeaseStatus.ENDED,
        LeaseStatus.VOIDED,
      ];

      statuses.forEach((status) => {
        const lease: Lease = {
          id: '123',
          userId: '456',
          propertyId: '789',
          startDate: new Date(),
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(lease.status).toBe(status);
      });
    });
  });

  describe('LeaseWithDetails interface', () => {
    it('should accept Lease with lessees and occupants', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: 'person-1',
            signedDate: new Date('2023-12-15'),
            person: {
              id: 'person-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '1234567890',
            },
          },
        ],
        occupants: [
          {
            id: 'occupant-1',
            personId: 'person-2',
            isAdult: true,
            moveInDate: new Date('2024-01-01'),
            person: {
              id: 'person-2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              phone: '0987654321',
            },
          },
        ],
      };

      expect(lease.lessees).toHaveLength(1);
      expect(lease.occupants).toHaveLength(1);
      expect(lease.lessees[0].person.firstName).toBe('John');
      expect(lease.occupants[0].person.firstName).toBe('Jane');
    });

    it('should accept empty lessees and occupants arrays', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [],
        occupants: [],
      };

      expect(lease.lessees).toEqual([]);
      expect(lease.occupants).toEqual([]);
    });

    it('should accept multiple lessees', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: 'person-1',
            person: {
              id: 'person-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '1234567890',
            },
          },
          {
            id: 'lessee-2',
            personId: 'person-2',
            person: {
              id: 'person-2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: '0987654321',
            },
          },
        ],
        occupants: [],
      };

      expect(lease.lessees).toHaveLength(2);
      expect(lease.lessees[0].person.lastName).toBe('Doe');
      expect(lease.lessees[1].person.lastName).toBe('Smith');
    });

    it('should accept lessee with optional fields', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: 'person-1',
            signedDate: new Date('2023-12-15'),
            person: {
              id: 'person-1',
              firstName: 'John',
              lastName: 'Doe',
              middleName: 'Michael',
              email: 'john@example.com',
              phone: '1234567890',
            },
          },
        ],
        occupants: [],
      };

      expect(lease.lessees[0].signedDate).toBeInstanceOf(Date);
      expect(lease.lessees[0].person.middleName).toBe('Michael');
    });

    it('should accept occupant with all fields', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [],
        occupants: [
          {
            id: 'occupant-1',
            personId: 'person-1',
            isAdult: false,
            moveInDate: new Date('2024-01-01'),
            moveOutDate: new Date('2024-06-01'),
            person: {
              id: 'person-1',
              firstName: 'Tommy',
              lastName: 'Doe',
              middleName: 'Jr',
              email: 'tommy@example.com',
              phone: '1231231234',
            },
          },
        ],
      };

      expect(lease.occupants[0].isAdult).toBe(false);
      expect(lease.occupants[0].moveInDate).toBeInstanceOf(Date);
      expect(lease.occupants[0].moveOutDate).toBeInstanceOf(Date);
      expect(lease.occupants[0].person.middleName).toBe('Jr');
    });

    it('should accept child occupant without email and phone', () => {
      const lease: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [],
        occupants: [
          {
            id: 'occupant-1',
            personId: 'person-1',
            isAdult: false,
            person: {
              id: 'person-1',
              firstName: 'Child',
              lastName: 'Doe',
            },
          },
        ],
      };

      expect(lease.occupants[0].isAdult).toBe(false);
      expect(lease.occupants[0].person.email).toBeUndefined();
      expect(lease.occupants[0].person.phone).toBeUndefined();
    });
  });

  describe('type compatibility', () => {
    it('should allow LeaseWithDetails to be assigned to Lease', () => {
      const leaseWithDetails: LeaseWithDetails = {
        id: '123',
        userId: '456',
        propertyId: '789',
        startDate: new Date('2024-01-01'),
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [],
        occupants: [],
      };

      // LeaseWithDetails extends Lease
      const lease: Lease = leaseWithDetails;

      expect(lease.id).toBe('123');
      expect(lease.status).toBe(LeaseStatus.ACTIVE);
    });
  });
});
