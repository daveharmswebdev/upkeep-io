import { AddLesseeToLeaseUseCase } from './AddLesseeToLeaseUseCase';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { Person, LeaseWithDetails, LeaseStatus } from '@domain/entities';
import { NotFoundError } from '@domain/errors';

describe('AddLesseeToLeaseUseCase', () => {
  let addLesseeToLeaseUseCase: AddLesseeToLeaseUseCase;
  let mockLeaseRepository: jest.Mocked<ILeaseRepository>;
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
      addPet: jest.fn(),
      removePet: jest.fn(),
    };

    mockPersonRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    addLesseeToLeaseUseCase = new AddLesseeToLeaseUseCase(
      mockLeaseRepository,
      mockPersonRepository
    );
  });

  describe('execute', () => {
    const validUserId = 'user-123';
    const validLeaseId = 'lease-456';
    const validPropertyId = 'prop-789';

    const mockExistingLease: LeaseWithDetails = {
      id: validLeaseId,
      userId: validUserId,
      propertyId: validPropertyId,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      monthlyRent: 2000,
      securityDeposit: 4000,
      status: LeaseStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      lessees: [
        {
          id: 'lessee-1',
          personId: 'person-1',
          signedDate: new Date('2024-12-15'),
          person: {
            id: 'person-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '555-0001',
          },
        },
      ],
      occupants: [
        {
          id: 'occupant-1',
          personId: 'person-child',
          isAdult: false,
          person: {
            id: 'person-child',
            firstName: 'Child',
            lastName: 'Doe',
          },
        },
      ],
    pets: [],
    };

    it('should successfully add lessee with existing personId (void + recreate pattern)', async () => {
      const newPersonId = 'person-2';
      const mockNewPerson: Person = {
        id: newPersonId,
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-0002',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const input = {
        voidedReason: 'Adding spouse to lease',
        newLessee: {
          personId: newPersonId,
          signedDate: new Date('2025-02-01'),
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-12-31'),
          monthlyRent: 2000,
          securityDeposit: 4000,
        },
      };

      const mockNewLease: LeaseWithDetails = {
        id: 'lease-new',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.newLeaseData.startDate,
        endDate: input.newLeaseData.endDate,
        monthlyRent: input.newLeaseData.monthlyRent,
        securityDeposit: input.newLeaseData.securityDeposit,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          mockExistingLease.lessees[0],
          {
            id: 'lessee-2',
            personId: newPersonId,
            signedDate: input.newLessee.signedDate,
            person: {
              id: mockNewPerson.id,
              firstName: mockNewPerson.firstName,
              lastName: mockNewPerson.lastName,
              email: mockNewPerson.email!,
              phone: mockNewPerson.phone!,
            },
          },
        ],
        occupants: mockExistingLease.occupants,
        pets: [],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.findById.mockResolvedValue(mockNewPerson);
      mockLeaseRepository.voidLease.mockResolvedValue(undefined);
      mockLeaseRepository.create.mockResolvedValue(mockNewLease);

      const result = await addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input);

      expect(mockLeaseRepository.findById).toHaveBeenCalledWith(validLeaseId);
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(newPersonId);
      expect(mockLeaseRepository.voidLease).toHaveBeenCalledWith(validLeaseId, input.voidedReason);
      expect(mockLeaseRepository.create).toHaveBeenCalledWith({
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.newLeaseData.startDate,
        endDate: input.newLeaseData.endDate,
        monthlyRent: input.newLeaseData.monthlyRent,
        securityDeposit: input.newLeaseData.securityDeposit,
        depositPaidDate: undefined,
        notes: undefined,
        lessees: [
          {
            personId: 'person-1',
            signedDate: mockExistingLease.lessees[0].signedDate,
          },
          {
            personId: newPersonId,
            signedDate: input.newLessee.signedDate,
          },
        ],
        occupants: [
          {
            personId: 'person-child',
            isAdult: false,
            moveInDate: undefined,
          },
        ],
      });
      expect(result).toBe('lease-new');
    });

    it('should successfully add lessee with inline person creation', async () => {
      const input = {
        voidedReason: 'Adding spouse to lease',
        newLessee: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '555-0002',
          signedDate: new Date('2025-02-01'),
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
          monthlyRent: 2000,
        },
      };

      const mockCreatedPerson: Person = {
        id: 'person-new',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-0002',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewLease: LeaseWithDetails = {
        id: 'lease-new',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.newLeaseData.startDate,
        monthlyRent: input.newLeaseData.monthlyRent,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [
          mockExistingLease.lessees[0],
          {
            id: 'lessee-2',
            personId: mockCreatedPerson.id,
            signedDate: input.newLessee.signedDate,
            person: {
              id: mockCreatedPerson.id,
              firstName: mockCreatedPerson.firstName,
              lastName: mockCreatedPerson.lastName,
              email: mockCreatedPerson.email!,
              phone: mockCreatedPerson.phone!,
            },
          },
        ],
        occupants: mockExistingLease.occupants,
        pets: [],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.create.mockResolvedValue(mockCreatedPerson);
      mockLeaseRepository.voidLease.mockResolvedValue(undefined);
      mockLeaseRepository.create.mockResolvedValue(mockNewLease);

      const result = await addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input);

      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: undefined,
        email: 'jane@example.com',
        phone: '555-0002',
        notes: undefined,
      });
      expect(result).toBe('lease-new');
    });

    it('should throw NotFoundError when lease does not exist', async () => {
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          personId: 'person-2',
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      mockLeaseRepository.findById.mockResolvedValue(null);

      await expect(addLesseeToLeaseUseCase.execute('nonexistent-lease', validUserId, input)).rejects.toThrow(
        NotFoundError
      );

      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when lease does not belong to user', async () => {
      const wrongUserId = 'different-user-999';
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          personId: 'person-2',
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);

      await expect(addLesseeToLeaseUseCase.execute(validLeaseId, wrongUserId, input)).rejects.toThrow(
        'Lease does not belong to this user'
      );

      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when person does not exist (for existing personId)', async () => {
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          personId: 'nonexistent-person',
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.findById.mockResolvedValue(null);

      await expect(addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input)).rejects.toThrow(
        NotFoundError
      );

      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when person does not belong to user', async () => {
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          personId: 'person-2',
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      const mockPerson: Person = {
        id: 'person-2',
        userId: 'different-user-999',
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-0002',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.findById.mockResolvedValue(mockPerson);

      await expect(addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input)).rejects.toThrow(
        'Person does not belong to this user'
      );

      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when inline creation missing required fields', async () => {
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          firstName: 'Jane',
          lastName: 'Smith',
          // Missing email and phone
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);

      await expect(addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input as any)).rejects.toThrow(
        'Lessee must have firstName, lastName, email, and phone for inline creation'
      );

      expect(mockPersonRepository.create).not.toHaveBeenCalled();
      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when new lessee is already on the lease (duplicate check)', async () => {
      const existingPersonId = 'person-1'; // This person is already on the lease
      const input = {
        voidedReason: 'Attempting to add duplicate',
        newLessee: {
          personId: existingPersonId,
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      const mockPerson: Person = {
        id: existingPersonId,
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-0001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.findById.mockResolvedValue(mockPerson);

      await expect(addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input)).rejects.toThrow(
        'This person is already a lessee on this lease'
      );

      expect(mockLeaseRepository.voidLease).not.toHaveBeenCalled();
      expect(mockLeaseRepository.create).not.toHaveBeenCalled();
    });

    it('should return new lease ID after void + recreate', async () => {
      const input = {
        voidedReason: 'Adding spouse',
        newLessee: {
          personId: 'person-2',
        },
        newLeaseData: {
          startDate: new Date('2025-02-01'),
        },
      };

      const mockPerson: Person = {
        id: 'person-2',
        userId: validUserId,
        personType: 'LESSEE',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-0002',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewLease: LeaseWithDetails = {
        id: 'lease-999',
        userId: validUserId,
        propertyId: validPropertyId,
        startDate: input.newLeaseData.startDate,
        status: LeaseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessees: [mockExistingLease.lessees[0]],
        occupants: [],
      pets: [],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockExistingLease);
      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockLeaseRepository.voidLease.mockResolvedValue(undefined);
      mockLeaseRepository.create.mockResolvedValue(mockNewLease);

      const result = await addLesseeToLeaseUseCase.execute(validLeaseId, validUserId, input);

      expect(result).toBe('lease-999');
      expect(typeof result).toBe('string');
    });
  });
});
