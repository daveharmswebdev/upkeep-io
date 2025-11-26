import { RemovePetFromLeaseUseCase } from './RemovePetFromLeaseUseCase';
import { ILeaseRepository } from '../../domain/repositories/ILeaseRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import { LeaseStatus } from '@domain/entities';
import type { LeaseWithDetails } from '@domain/entities';

describe('RemovePetFromLeaseUseCase', () => {
  let useCase: RemovePetFromLeaseUseCase;
  let mockLeaseRepository: jest.Mocked<ILeaseRepository>;

  const userId = 'user-123';
  const leaseId = 'lease-456';
  const petId = 'pet-789';

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
    pets: [
      {
        id: petId,
        leaseId,
        name: 'Whiskers',
        species: 'cat',
        notes: 'Gray tabby',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
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

    useCase = new RemovePetFromLeaseUseCase(mockLeaseRepository);
  });

  it('should remove a pet from a lease', async () => {
    const updatedLease: LeaseWithDetails = {
      ...mockLease,
      pets: [],
    };

    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);
    mockLeaseRepository.removePet.mockResolvedValueOnce(undefined);
    mockLeaseRepository.findById.mockResolvedValueOnce(updatedLease);

    const result = await useCase.execute(leaseId, userId, petId);

    expect(mockLeaseRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.removePet).toHaveBeenCalledWith(leaseId, petId);
    expect(result.pets).toHaveLength(0);
  });

  it('should throw NotFoundError if lease does not exist', async () => {
    mockLeaseRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(leaseId, userId, petId)).rejects.toThrow(
      new NotFoundError('Lease', leaseId)
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.removePet).not.toHaveBeenCalled();
  });

  it('should throw ValidationError if lease does not belong to user', async () => {
    const wrongUserId = 'wrong-user-456';
    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);

    await expect(useCase.execute(leaseId, wrongUserId, petId)).rejects.toThrow(
      new ValidationError('Lease does not belong to this user')
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.removePet).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if pet does not exist on the lease', async () => {
    const nonExistentPetId = 'non-existent-pet-999';
    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);

    await expect(useCase.execute(leaseId, userId, nonExistentPetId)).rejects.toThrow(
      new NotFoundError('Pet', nonExistentPetId)
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledWith(leaseId);
    expect(mockLeaseRepository.removePet).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if updated lease is not found after removing pet', async () => {
    mockLeaseRepository.findById.mockResolvedValueOnce(mockLease);
    mockLeaseRepository.removePet.mockResolvedValueOnce(undefined);
    mockLeaseRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute(leaseId, userId, petId)).rejects.toThrow(
      new NotFoundError('Lease', leaseId)
    );

    expect(mockLeaseRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockLeaseRepository.removePet).toHaveBeenCalled();
  });
});
