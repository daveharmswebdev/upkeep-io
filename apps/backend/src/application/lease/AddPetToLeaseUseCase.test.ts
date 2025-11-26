import { AddPetToLeaseUseCase } from './AddPetToLeaseUseCase';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import { LeaseStatus } from '@domain/entities';
import type { LeaseWithDetails } from '@domain/entities';

describe('AddPetToLeaseUseCase', () => {
  let useCase: AddPetToLeaseUseCase;
  let mockLeaseRepository: jest.Mocked<ILeaseRepository>;

  const userId = 'user-123';
  const leaseId = 'lease-456';

  const mockLease: LeaseWithDetails = {
    id: leaseId,
    userId,
    propertyId: 'property-123',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    monthlyRent: 2000,
    securityDeposit: 4000,
    depositPaidDate: new Date('2024-01-01'),
    petDeposit: 500,
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
    pets: [],
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
      addPet: jest.fn(),
      removePet: jest.fn(),
    } as any;

    useCase = new AddPetToLeaseUseCase(mockLeaseRepository);
  });

  it('should add a cat to a lease', async () => {
    const petData = {
      name: 'Whiskers',
      species: 'cat' as const,
      notes: 'Gray tabby',
    };

    const updatedLease: LeaseWithDetails = {
      ...mockLease,
      pets: [
        {
          id: 'pet-1',
          leaseId,
          name: 'Whiskers',
          species: 'cat',
          notes: 'Gray tabby',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);
    mockLeaseRepository.addPet.mockResolvedValueOnce(undefined);
    mockLeaseRepository.findById.mockResolvedValueOnce(updatedLease);

    const result = await useCase.execute(leaseId, userId, petData);

    expect(mockLeaseRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.addPet).toHaveBeenCalledWith({
      leaseId,
      name: 'Whiskers',
      species: 'cat',
      notes: 'Gray tabby',
    });
    expect(result.pets).toHaveLength(1);
    expect(result.pets[0].name).toBe('Whiskers');
    expect(result.pets[0].species).toBe('cat');
  });

  it('should add a dog to a lease without notes', async () => {
    const petData = {
      name: 'Buddy',
      species: 'dog' as const,
    };

    const updatedLease: LeaseWithDetails = {
      ...mockLease,
      pets: [
        {
          id: 'pet-2',
          leaseId,
          name: 'Buddy',
          species: 'dog',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);
    mockLeaseRepository.addPet.mockResolvedValueOnce(undefined);
    mockLeaseRepository.findById.mockResolvedValueOnce(updatedLease);

    const result = await useCase.execute(leaseId, userId, petData);

    expect(mockLeaseRepository.addPet).toHaveBeenCalledWith({
      leaseId,
      name: 'Buddy',
      species: 'dog',
      notes: undefined,
    });
    expect(result.pets).toHaveLength(1);
    expect(result.pets[0].name).toBe('Buddy');
    expect(result.pets[0].species).toBe('dog');
  });

  it('should throw NotFoundError if lease does not exist', async () => {
    mockLeaseRepository.findById.mockResolvedValueOnce(null);

    const petData = {
      name: 'Whiskers',
      species: 'cat' as const,
    };

    await expect(useCase.execute(leaseId, userId, petData)).rejects.toThrow(
      new NotFoundError('Lease', leaseId)
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.addPet).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if lease does not belong to user', async () => {
    const wrongUserId = 'wrong-user-456';
    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);

    const petData = {
      name: 'Whiskers',
      species: 'cat' as const,
    };

    await expect(useCase.execute(leaseId, wrongUserId, petData)).rejects.toThrow(
      new ValidationError('Lease does not belong to this user')
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.addPet).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if updated lease is not found after adding pet', async () => {
    const petData = {
      name: 'Whiskers',
      species: 'cat' as const,
    };

    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);
    mockLeaseRepository.addPet.mockResolvedValueOnce(undefined);
    mockLeaseRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(leaseId, userId, petData)).rejects.toThrow(
      new NotFoundError('Lease', leaseId)
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockLeaseRepository.addPet).toHaveBeenCalled();
  });
});
