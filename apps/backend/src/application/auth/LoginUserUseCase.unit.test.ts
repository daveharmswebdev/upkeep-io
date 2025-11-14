import { LoginUserUseCase } from './LoginUserUseCase';
import { IUserRepository } from '../../domain/repositories';
import { IPasswordHasher, ITokenGenerator } from '../../domain/services';
import { ValidationError } from '@domain/errors';
import { User } from '@domain/entities';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
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

    loginUserUseCase = new LoginUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator
    );
  });

  describe('execute', () => {
    it('should login user and return token when valid credentials provided', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '123',
        email: input.email,
        passwordHash: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenGenerator.generate.mockReturnValue('mock-token');

      const result = await loginUserUseCase.execute(input);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        input.password,
        mockUser.passwordHash
      );
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

    it('should throw ValidationError when user not found', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUserUseCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(loginUserUseCase.execute(input)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw ValidationError when password is incorrect', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser: User = {
        id: '123',
        email: input.email,
        passwordHash: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(loginUserUseCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(loginUserUseCase.execute(input)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
