import { CreateUserUseCase } from './CreateUserUseCase';
import { IUserRepository } from '../../domain/repositories';
import { IPasswordHasher, ITokenGenerator } from '../../domain/services';
import { ValidationError } from '@domain/errors';
import { User } from '@domain/entities';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenGenerator: jest.Mocked<ITokenGenerator>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenGenerator = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    createUserUseCase = new CreateUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator
    );
  });

  describe('execute', () => {
    it('should create a user and return token when valid input provided', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser: User = {
        id: '123',
        email: input.email,
        passwordHash: 'hashedpassword',
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockTokenGenerator.generate.mockReturnValue('mock-token');

      const result = await createUserUseCase.execute(input);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: input.email,
        passwordHash: 'hashedpassword',
        name: input.name,
      });
      expect(mockTokenGenerator.generate).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        token: 'mock-token',
      });
    });

    it('should throw ValidationError when email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const existingUser: User = {
        id: '123',
        email: input.email,
        passwordHash: 'hashedpassword',
        name: 'Existing User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(createUserUseCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(createUserUseCase.execute(input)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw ValidationError when password is too short', async () => {
      const input = {
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email is invalid', async () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      await expect(createUserUseCase.execute(input)).rejects.toThrow(ValidationError);
    });
  });
});
