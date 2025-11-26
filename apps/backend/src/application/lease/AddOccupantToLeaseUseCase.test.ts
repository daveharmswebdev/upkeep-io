import { AddOccupantToLeaseUseCase } from './AddOccupantToLeaseUseCase';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { NotFoundError, ValidationError, type Person, LeaseStatus } from '@upkeep-io/domain';
import type { LeaseWithDetails } from '@upkeep-io/domain';

describe('AddOccupantToLeaseUseCase', () => {
  let useCase: AddOccupantToLeaseUseCase;
  let mockLeaseRepository: jest.Mocked<ILeaseRepository>;
  let mockPersonRepository: jest.Mocked<IPersonRepository>;

  const userId = 'user-123';
  const leaseId = 'lease-456';
  const existingPersonId = 'person-789';

  const mockLease: LeaseWithDetails = {
    id: leaseId,
    userId,
    propertyId: 'property-123',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    monthlyRent: 2000,
    securityDeposit: 4000,
    depositPaidDate: new Date('2024-01-01'),
    notes: 'Test lease',
    status: LeaseStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    lessees: [
      {
        id: 'lessee-rel-1',
        personId: 'lessee-1',
        signedDate: new Date('2023-12-15'),
        person: {
          id: 'lessee-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
        },
      },
    ],
    occupants: [],
  };

  beforeEach(() => {
    mockLeaseRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByPropertyId: jest.fn(),
      voidLease: jest.fn(),
      addOccupant: jest.fn(),
      removeOccupant: jest.fn(),
      removeLessee: jest.fn(),
    } as any;

    mockPersonRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    useCase = new AddOccupantToLeaseUseCase(mockLeaseRepository, mockPersonRepository);
  });

  describe('using existing personId', () => {
    it('should add adult occupant with existing person', async () => {
      const existingPerson: Person = {
        id: existingPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLease: LeaseWithDetails = {
        ...mockLease,
        occupants: [
          {
            id: 'occupant-rel-1',
            personId: existingPersonId,
            isAdult: true,
            moveInDate: new Date('2024-02-01'),
            person: {
              id: existingPerson.id,
              firstName: existingPerson.firstName,
              lastName: existingPerson.lastName,
              email: existingPerson.email,
              phone: existingPerson.phone,
            },
          },
        ],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockLeaseRepository.addOccupant.mockResolvedValue(undefined);
      mockLeaseRepository.findById.mockResolvedValueOnce(mockLease).mockResolvedValueOnce(updatedLease);

      const result = await useCase.execute(leaseId, userId, {
        personId: existingPersonId,
        isAdult: true,
        moveInDate: new Date('2024-02-01'),
      });

      expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(existingPersonId);
      expect(mockLeaseRepository.addOccupant).toHaveBeenCalledWith({
        leaseId,
        personId: existingPersonId,
        isAdult: true,
        moveInDate: expect.any(Date),
      });
      expect(result.occupants).toHaveLength(1);
      expect(result.occupants![0].personId).toBe(existingPersonId);
    });

    it('should throw NotFoundError if lease does not exist', async () => {
      mockLeaseRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(leaseId, userId, {
          personId: existingPersonId,
          isAdult: true,
        })
      ).rejects.toThrow(new NotFoundError('Lease', leaseId));

      expect(mockPersonRepository.findById).not.toHaveBeenCalled();
      expect(mockLeaseRepository.addOccupant).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if lease does not belong to user', async () => {
      mockLeaseRepository.findById.mockResolvedValue({
        ...mockLease,
        userId: 'different-user',
      });

      await expect(
        useCase.execute(leaseId, userId, {
          personId: existingPersonId,
          isAdult: true,
        })
      ).rejects.toThrow(new ValidationError('Lease does not belong to this user'));

      expect(mockPersonRepository.findById).not.toHaveBeenCalled();
      expect(mockLeaseRepository.addOccupant).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if person does not exist', async () => {
      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(leaseId, userId, {
          personId: existingPersonId,
          isAdult: true,
        })
      ).rejects.toThrow(new NotFoundError('Person', existingPersonId));

      expect(mockLeaseRepository.addOccupant).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if person does not belong to user', async () => {
      const differentUserPerson: Person = {
        id: existingPersonId,
        userId: 'different-user',
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.findById.mockResolvedValue(differentUserPerson);

      await expect(
        useCase.execute(leaseId, userId, {
          personId: existingPersonId,
          isAdult: true,
        })
      ).rejects.toThrow(new ValidationError('Person does not belong to this user'));

      expect(mockLeaseRepository.addOccupant).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if adult occupant lacks email or phone', async () => {
      const personWithoutEmail: Person = {
        id: existingPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-5678',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.findById.mockResolvedValue(personWithoutEmail);

      await expect(
        useCase.execute(leaseId, userId, {
          personId: existingPersonId,
          isAdult: true,
        })
      ).rejects.toThrow(new ValidationError('Adult occupants must have email and phone'));

      expect(mockLeaseRepository.addOccupant).not.toHaveBeenCalled();
    });
  });

  describe('inline person creation', () => {
    it('should create adult occupant inline with all required fields', async () => {
      const newPersonId = 'new-person-123';
      const createdPerson: Person = {
        id: newPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-9876',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLease: LeaseWithDetails = {
        ...mockLease,
        occupants: [
          {
            id: 'occupant-rel-2',
            personId: newPersonId,
            isAdult: true,
            moveInDate: new Date('2024-03-01'),
            person: {
              id: createdPerson.id,
              firstName: createdPerson.firstName,
              lastName: createdPerson.lastName,
              email: createdPerson.email,
              phone: createdPerson.phone,
            },
          },
        ],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.create.mockResolvedValue(createdPerson);
      mockLeaseRepository.addOccupant.mockResolvedValue(undefined);
      mockLeaseRepository.findById.mockResolvedValueOnce(mockLease).mockResolvedValueOnce(updatedLease);

      const result = await useCase.execute(leaseId, userId, {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-9876',
        moveInDate: new Date('2024-03-01'),
      });

      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: undefined,
        email: 'jane.smith@example.com',
        phone: '555-9876',
        notes: undefined,
      });
      expect(mockLeaseRepository.addOccupant).toHaveBeenCalledWith({
        leaseId,
        personId: newPersonId,
        isAdult: true,
        moveInDate: expect.any(Date),
      });
      expect(result.occupants).toHaveLength(1);
    });

    it('should create child occupant inline without email/phone', async () => {
      const newPersonId = 'new-child-123';
      const createdPerson: Person = {
        id: newPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Tommy',
        lastName: 'Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLease: LeaseWithDetails = {
        ...mockLease,
        occupants: [
          {
            id: 'occupant-rel-3',
            personId: newPersonId,
            isAdult: false,
            person: {
              id: createdPerson.id,
              firstName: createdPerson.firstName,
              lastName: createdPerson.lastName,
            },
          },
        ],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.create.mockResolvedValue(createdPerson);
      mockLeaseRepository.addOccupant.mockResolvedValue(undefined);
      mockLeaseRepository.findById.mockResolvedValueOnce(mockLease).mockResolvedValueOnce(updatedLease);

      const result = await useCase.execute(leaseId, userId, {
        isAdult: false,
        firstName: 'Tommy',
        lastName: 'Smith',
      });

      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId,
        personType: 'OCCUPANT',
        firstName: 'Tommy',
        lastName: 'Smith',
        middleName: undefined,
        email: undefined,
        phone: undefined,
        notes: undefined,
      });
      expect(mockLeaseRepository.addOccupant).toHaveBeenCalledWith({
        leaseId,
        personId: newPersonId,
        isAdult: false,
        moveInDate: undefined,
      });
      expect(result.occupants).toHaveLength(1);
    });

    it('should create inline occupant with optional fields', async () => {
      const newPersonId = 'new-person-456';
      const createdPerson: Person = {
        id: newPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Marie',
        email: 'jane@example.com',
        phone: '555-1111',
        notes: 'Guest room',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLease: LeaseWithDetails = {
        ...mockLease,
        occupants: [
          {
            id: 'occupant-rel-4',
            personId: newPersonId,
            isAdult: true,
            moveInDate: new Date('2024-04-01'),
            person: {
              id: createdPerson.id,
              firstName: createdPerson.firstName,
              lastName: createdPerson.lastName,
              middleName: createdPerson.middleName,
              email: createdPerson.email,
              phone: createdPerson.phone,
            },
          },
        ],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.create.mockResolvedValue(createdPerson);
      mockLeaseRepository.addOccupant.mockResolvedValue(undefined);
      mockLeaseRepository.findById.mockResolvedValueOnce(mockLease).mockResolvedValueOnce(updatedLease);

      const result = await useCase.execute(leaseId, userId, {
        isAdult: true,
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Marie',
        email: 'jane@example.com',
        phone: '555-1111',
        notes: 'Guest room',
        moveInDate: new Date('2024-04-01'),
      });

      expect(mockPersonRepository.create).toHaveBeenCalledWith({
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'Marie',
        email: 'jane@example.com',
        phone: '555-1111',
        notes: 'Guest room',
      });
      expect(result.occupants).toHaveLength(1);
    });
  });

  describe('return value', () => {
    it('should return updated LeaseWithDetails after adding occupant', async () => {
      const existingPerson: Person = {
        id: existingPersonId,
        userId,
        personType: 'OCCUPANT',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLease: LeaseWithDetails = {
        ...mockLease,
        occupants: [
          {
            id: 'occupant-rel-5',
            personId: existingPersonId,
            isAdult: true,
            person: {
              id: existingPerson.id,
              firstName: existingPerson.firstName,
              lastName: existingPerson.lastName,
              email: existingPerson.email,
              phone: existingPerson.phone,
            },
          },
        ],
      };

      mockLeaseRepository.findById.mockResolvedValue(mockLease);
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockLeaseRepository.addOccupant.mockResolvedValue(undefined);
      mockLeaseRepository.findById.mockResolvedValueOnce(mockLease).mockResolvedValueOnce(updatedLease);

      const result = await useCase.execute(leaseId, userId, {
        personId: existingPersonId,
        isAdult: true,
      });

      expect(result).toEqual(updatedLease);
      expect(result.occupants).toBeDefined();
      expect(result.occupants!.length).toBe(1);
    });
  });
});
