import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories';
import { IPasswordHasher, ITokenGenerator } from '../../domain/services';
import { ValidationError } from '@domain/errors';
import { signupSchema } from '@validators/auth';

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

interface CreateUserOutput {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordHasher') private passwordHasher: IPasswordHasher,
    @inject('ITokenGenerator') private tokenGenerator: ITokenGenerator
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Validate input
    const validation = signupSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

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
