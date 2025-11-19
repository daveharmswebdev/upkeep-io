import { CreateLeaseUseCase } from './CreateLeaseUseCase';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { Property, Person, LeaseWithDetails, LeaseStatus } from '@domain/entities';
import { NotFoundError } from '@domain/errors';

describe('CreateLeaseUseCase', () => {
  let createLeaseUseCase: CreateLeaseUseCase;
  let mockLeaseRepository: jest.Mocked<ILeaseRepository>;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;
  let mockPersonRepository: jest.Mocked<IPersonRepository>;

  beforeEach(() => {
    mockLeaseRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByPropertyId: jest.fn(),
      findActiveByPropertyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      addLessee: jest.fn(),
      removeLessee: jest.fn(),
      addOccupant: jest.fn(),
      removeOccupant: jest.fn(),
      voidLease: jest.fn(),
    };

    mockPropertyRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPersonRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createLeaseUseCase = new CreateLeaseUseCase(
      mockLeaseRepository,
      mockPropertyRepository,
      mockPersonRepository
    );
  });

  describe('execute', () => {
    const validUserId = 'user-123';
    const validPropertyId = 'prop-456';

    const mockProperty: Property = {
      id: validPropertyId,
      userId: validUserId,
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a lease with single lessee (inline person creation)', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        monthlyRent: 2000,
        securityDeposit: 4000,
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
            signedDate: new Date('2024-12-15'),
          },
        ],
      };

      const mockPerson: Person = {
        id: 'person-789',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555-0101',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-999',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        endDate: input.endDate,
        monthlyRent: input.monthlyRent,
        securityDeposit: input.securityDeposit,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-111',
            personId: mockPerson.id,
            signedDate: input.lessees[0].signedDate,
            person: {
              id: mockPerson.id,
              firstName: mockPerson.firstName,
              lastName: mockPerson.lastName,
              email: mockPerson.email!,
              phone: mockPerson.phone!,
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(validPropertyId);
      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Doe',
        middleName: undefined,
        email: 'jane@example.com',
        phone: '555-0101',
        notes: undefined,
      });
      expect(mockLeaseRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockLease);
    });

    it('should create a lease with multiple lessees', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        monthlyRent: 2500,
        lessees: [
          {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            phone: '555-0201',
          },
          {
            firstName: 'Mary',
            lastName: 'Smith',
            email: 'mary@example.com',
            phone: '555-0202',
          },
        ],
      };

      const mockPerson1: Person = {
        id: 'person-1',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        phone: '555-0201',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPerson2: Person = {
        id: 'person-2',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Mary',
        lastName: 'Smith',
        email: 'mary@example.com',
        phone: '555-0202',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-couple',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        monthlyRent: input.monthlyRent,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: mockPerson1.id,
            person: {
              id: mockPerson1.id,
              firstName: mockPerson1.firstName,
              lastName: mockPerson1.lastName,
              email: mockPerson1.email!,
              phone: mockPerson1.phone!,
            },
          },
          {
            id: 'lessee-2',
            personId: mockPerson2.id,
            person: {
              id: mockPerson2.id,
              firstName: mockPerson2.firstName,
              lastName: mockPerson2.lastName,
              email: mockPerson2.email!,
              phone: mockPerson2.phone!,
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create
        .mockResolvedValueOnce(mockPerson1)
        .mockResolvedValueOnce(mockPerson2);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(mockPersonRepository.create).toHaveBeenCalledTimes(2);
      expect(result.lessees).toHaveLength(2);
    });

    it('should create a lease with lessees and child occupants', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-02-01'),
        monthlyRent: 3000,
        lessees: [
          {
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
            phone: '555-0301',
          },
        ],
        occupants: [
          {
            firstName: 'Tommy',
            lastName: 'Johnson',
            isAdult: false,
          },
        ],
      };

      const mockLessee: Person = {
        id: 'person-lessee',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        phone: '555-0301',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockChildOccupant: Person = {
        id: 'person-child',
        userId: validUserId,
        personType: 'OCCUPANT',
        firstName: 'Tommy',
        lastName: 'Johnson',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-family',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        monthlyRent: input.monthlyRent,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: mockLessee.id,
            person: {
              id: mockLessee.id,
              firstName: mockLessee.firstName,
              lastName: mockLessee.lastName,
              email: mockLessee.email!,
              phone: mockLessee.phone!,
            },
          },
        ],
        occupants: [
          {
            id: 'occupant-1',
            personId: mockChildOccupant.id,
            isAdult: false,
            person: {
              id: mockChildOccupant.id,
              firstName: mockChildOccupant.firstName,
              lastName: mockChildOccupant.lastName,
            },
          },
        ],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create
        .mockResolvedValueOnce(mockLessee)
        .mockResolvedValueOnce(mockChildOccupant);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(result.occupants).toHaveLength(1);
      expect(result.occupants[0].isAdult).toBe(false);
    });

    it('should throw NotFoundError when property does not exist', async () => {
      const input = {
        userId: validUserId,
        propertyId: 'nonexistent-prop',
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      mockPropertyRepository.findById.mockResolvedValue(null);

      await expect(createLeaseUseCase.execute(input)).rejects.toThrow(NotFoundError);

      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when property does not belong to user', async () => {
      const wrongUserId = 'different-user-999';
      const input = {
        userId: wrongUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      // Property belongs to validUserId, but request is from wrongUserId
      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      await expect(createLeaseUseCase.execute(input)).rejects.toThrow(
        'Property does not belong to this user'
      );

      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when lessee inline creation missing required fields', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            // Missing email and phone
          },
        ],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      await expect(createLeaseUseCase.execute(input as any)).rejects.toThrow(
        'Lessee must have firstName, lastName, email, and phone for inline creation'
      );
    });

    it('should throw ValidationError when adult occupant missing email/phone', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Sarah',
            lastName: 'Williams',
            email: 'sarah@example.com',
            phone: '555-0401',
          },
        ],
        occupants: [
          {
            firstName: 'Mike',
            lastName: 'Brown',
            isAdult: true,
            // Missing email and phone for adult
          },
        ],
      };

      const mockLessee: Person = {
        id: 'person-lessee',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@example.com',
        phone: '555-0401',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValueOnce(mockLessee);

      await expect(createLeaseUseCase.execute(input as any)).rejects.toThrow(
        'Adult occupants must have email and phone'
      );
    });

    it('should allow child occupants without email/phone', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Parent',
            lastName: 'Name',
            email: 'parent@example.com',
            phone: '555-0001',
          },
        ],
        occupants: [
          {
            firstName: 'Child',
            lastName: 'Name',
            isAdult: false,
            // No email/phone - should be allowed for children
          },
        ],
      };

      const mockLessee: Person = {
        id: 'person-lessee',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Parent',
        lastName: 'Name',
        email: 'parent@example.com',
        phone: '555-0001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockChild: Person = {
        id: 'person-child',
        userId: validUserId,
        personType: 'OCCUPANT',
        firstName: 'Child',
        lastName: 'Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-123',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: mockLessee.id,
            person: {
              id: mockLessee.id,
              firstName: mockLessee.firstName,
              lastName: mockLessee.lastName,
              email: mockLessee.email!,
              phone: mockLessee.phone!,
            },
          },
        ],
        occupants: [
          {
            id: 'occupant-1',
            personId: mockChild.id,
            isAdult: false,
            person: {
              id: mockChild.id,
              firstName: mockChild.firstName,
              lastName: mockChild.lastName,
            },
          },
        ],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create
        .mockResolvedValueOnce(mockLessee)
        .mockResolvedValueOnce(mockChild);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(result).toEqual(mockLease);
      expect(mockPersonRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Child',
          lastName: 'Name',
          personType: 'OCCUPANT',
          email: undefined,
          phone: undefined,
        })
      );
    });

    it('should throw ValidationError when property already has an ACTIVE lease', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      const existingActiveLease: LeaseWithDetails = {
        id: 'existing-lease-123',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        monthlyRent: 2000,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: 'person-1',
            person: {
              id: 'person-1',
              firstName: 'Existing',
              lastName: 'Tenant',
              email: 'existing@example.com',
              phone: '555-9999',
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(existingActiveLease);

      await expect(createLeaseUseCase.execute(input)).rejects.toThrow(
        'This property already has an active lease. Please end or void the existing lease before creating a new one.'
      );

      expect(mockLeaseRepository.findActiveByPropertyId).toHaveBeenCalledWith(validPropertyId);
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when property already has a MONTH_TO_MONTH lease', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      const existingMonthToMonthLease: LeaseWithDetails = {
        id: 'existing-lease-456',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2024-01-01'),
        monthlyRent: 2000,
        status: LeaseStatus.MONTH_TO_MONTH,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: 'person-1',
            person: {
              id: 'person-1',
              firstName: 'Existing',
              lastName: 'Tenant',
              email: 'existing@example.com',
              phone: '555-9999',
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(
        existingMonthToMonthLease
      );

      await expect(createLeaseUseCase.execute(input)).rejects.toThrow(
        'This property already has an active lease. Please end or void the existing lease before creating a new one.'
      );

      expect(mockLeaseRepository.findActiveByPropertyId).toHaveBeenCalledWith(validPropertyId);
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating a new lease when property has an ENDED lease', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      const mockPerson: Person = {
        id: 'person-new',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555-0101',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-new',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: mockPerson.id,
            person: {
              id: mockPerson.id,
              firstName: mockPerson.firstName,
              lastName: mockPerson.lastName,
              email: mockPerson.email!,
              phone: mockPerson.phone!,
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      // findActiveByPropertyId returns null because ENDED leases are not active
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(result).toEqual(mockLease);
      expect(mockLeaseRepository.findActiveByPropertyId).toHaveBeenCalledWith(validPropertyId);
      expect(mockLeaseRepository.create).toHaveBeenCalled();
    });

    it('should allow creating a new lease when property has a VOIDED lease', async () => {
      const input = {
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: new Date('2025-01-01'),
        lessees: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '555-0101',
          },
        ],
      };

      const mockPerson: Person = {
        id: 'person-new',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555-0101',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLease: LeaseWithDetails = {
        id: 'lease-new',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.startDate,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          {
            id: 'lessee-1',
            personId: mockPerson.id,
            person: {
              id: mockPerson.id,
              firstName: mockPerson.firstName,
              lastName: mockPerson.lastName,
              email: mockPerson.email!,
              phone: mockPerson.phone!,
            },
          },
        ],
        occupants: [],
      };

      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      // findActiveByPropertyId returns null because VOIDED leases are not active
      mockLeaseRepository.findActiveByPropertyId.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockLeaseRepository.create.mockResolvedValue(mockLease);

      const result = await createLeaseUseCase.execute(input);

      expect(result).toEqual(mockLease);
      expect(mockLeaseRepository.findActiveByPropertyId).toHaveBeenCalledWith(validPropertyId);
      expect(mockLeaseRepository.create).toHaveBeenCalled();
    });
  });
});
