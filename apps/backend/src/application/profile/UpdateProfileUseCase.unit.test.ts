import { UpdateProfileUseCase } from './UpdateProfileUseCase';
import { IProfileRepository } from '../../domain/repositories';
import { ValidationError } from '@domain/errors';
import { Profile } from '@domain/entities';

describe('UpdateProfileUseCase', () => {
  let updateProfileUseCase: UpdateProfileUseCase;
  let mockProfileRepository: jest.Mocked<IProfileRepository>;

  beforeEach(() => {
    mockProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    updateProfileUseCase = new UpdateProfileUseCase(mockProfileRepository);
  });

  describe('execute', () => {
    it('should update profile with valid input', async () => {
      const userId = 'user-123';
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const existingProfile: Profile = {
        id: 'profile-123',
        userId,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '5551234567',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile: Profile = {
        ...existingProfile,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);
      mockProfileRepository.update.mockResolvedValue(updatedProfile);

      const result = await updateProfileUseCase.execute({ userId, ...updateData });

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedProfile);
    });

    it('should throw ValidationError when firstName > 100 chars', async () => {
      const userId = 'user-123';
      const updateData = {
        firstName: 'A'.repeat(101),
      };

      const existingProfile: Profile = {
        id: 'profile-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);

      await expect(
        updateProfileUseCase.execute({ userId, ...updateData })
      ).rejects.toThrow(ValidationError);

      expect(mockProfileRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when phone < 10 chars', async () => {
      const userId = 'user-123';
      const updateData = {
        phone: '123456789', // 9 digits
      };

      const existingProfile: Profile = {
        id: 'profile-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);

      await expect(
        updateProfileUseCase.execute({ userId, ...updateData })
      ).rejects.toThrow(ValidationError);

      expect(mockProfileRepository.update).not.toHaveBeenCalled();
    });

    it('should create profile if not exists, then update', async () => {
      const userId = 'user-456';
      const updateData = {
        firstName: 'Alice',
      };

      const newProfile: Profile = {
        id: 'profile-456',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile: Profile = {
        ...newProfile,
        firstName: updateData.firstName,
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(null);
      mockProfileRepository.create.mockResolvedValue(newProfile);
      mockProfileRepository.update.mockResolvedValue(updatedProfile);

      const result = await updateProfileUseCase.execute({ userId, ...updateData });

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockProfileRepository.create).toHaveBeenCalledWith({ userId });
      expect(mockProfileRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedProfile);
    });

    it('should allow partial update (only updates provided fields)', async () => {
      const userId = 'user-789';
      const updateData = {
        firstName: 'Bob',
      };

      const existingProfile: Profile = {
        id: 'profile-789',
        userId,
        firstName: 'Alice',
        lastName: 'Johnson',
        phone: '5551234567',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile: Profile = {
        ...existingProfile,
        firstName: updateData.firstName,
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);
      mockProfileRepository.update.mockResolvedValue(updatedProfile);

      const result = await updateProfileUseCase.execute({ userId, ...updateData });

      expect(mockProfileRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result.firstName).toBe('Bob');
    });

    it('should throw ValidationError when empty string provided for firstName', async () => {
      const userId = 'user-123';
      const updateData = {
        firstName: '', // Empty string not allowed when provided
      };

      const existingProfile: Profile = {
        id: 'profile-123',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);

      await expect(
        updateProfileUseCase.execute({ userId, ...updateData })
      ).rejects.toThrow(ValidationError);

      expect(mockProfileRepository.update).not.toHaveBeenCalled();
    });

    it('should accept empty object (no update)', async () => {
      const userId = 'user-123';

      const existingProfile: Profile = {
        id: 'profile-123',
        userId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfileRepository.findByUserId.mockResolvedValue(existingProfile);
      mockProfileRepository.update.mockResolvedValue(existingProfile);

      const result = await updateProfileUseCase.execute({ userId });

      expect(mockProfileRepository.update).toHaveBeenCalledWith(userId, {});
      expect(result).toEqual(existingProfile);
    });
  });
});
