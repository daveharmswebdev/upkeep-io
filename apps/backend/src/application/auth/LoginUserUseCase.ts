import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories';
import { IPasswordHasher, ITokenGenerator } from '../../domain/services';
import { ValidationError } from '@domain/errors';
import { loginSchema } from '@validators/auth';

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordHasher') private passwordHasher: IPasswordHasher,
    @inject('ITokenGenerator') private tokenGenerator: ITokenGenerator
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Validate input
    const validation = loginSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    // Generate token
    const token = this.tokenGenerator.generate({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
}
