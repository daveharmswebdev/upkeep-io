import { GetProfileUseCase } from './GetProfileUseCase';
import { IProfileRepository } from '../../domain/repositories';
import { Profile } from '@domain/entities';

describe('GetProfileUseCase', () => {
  let getProfileUseCase: GetProfileUseCase;
  let mockProfileRepository: jest.Mocked<IProfileRepository>;

  beforeEach(() => {
    mockProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    getProfileUseCase = new GetProfileUseCase(mockProfileRepository);
  });

  describe('execute', () => {
    it('should return existing profile when it exists', async () => {
      const userId = 'user-123';

      const mockProfile: Profile = {
        id: 'profile-123',
        userId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      const result = await getProfileUseCase.execute({ userId });

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it('should create and return empty profile when none exists', async () => {
      const userId = 'user-456';

      const newProfile: Profile = {
        id: 'profile-456',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(null);
      mockProfileRepository.create.mockResolvedValue(newProfile);

      const result = await getProfileUseCase.execute({ userId });

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.create).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(newProfile);
    });

    it('should return profile with all fields populated', async () => {
      const userId = 'user-789';

      const mockProfile: Profile = {
        id: 'profile-789',
        userId,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '5551234567',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      const result = await getProfileUseCase.execute({ userId });

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.phone).toBe('5551234567');
    });
  });
});
