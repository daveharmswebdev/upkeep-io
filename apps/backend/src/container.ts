import { Container } from 'inversify';

// Domain interfaces
import { IUserRepository, IPropertyRepository } from './domain/repositories';
import { IPasswordHasher, ITokenGenerator, ILogger } from './domain/services';

// Infrastructure implementations
import { PrismaUserRepository, PrismaPropertyRepository } from './infrastructure/repositories';
import { BcryptPasswordHasher, JwtTokenGenerator, ConsoleLogger } from './infrastructure/services';

// Use cases
import { CreateUserUseCase, LoginUserUseCase } from './application/auth';
import { CreatePropertyUseCase, ListPropertiesUseCase } from './application/property';

// Controllers
import { AuthController, PropertyController } from './presentation/controllers';

export function createContainer(): Container {
  const container = new Container();

  // Bind repositories
  container
    .bind<IUserRepository>('IUserRepository')
    .to(PrismaUserRepository)
    .inTransientScope();

  container
    .bind<IPropertyRepository>('IPropertyRepository')
    .to(PrismaPropertyRepository)
    .inTransientScope();

  // Bind services
  container
    .bind<IPasswordHasher>('IPasswordHasher')
    .to(BcryptPasswordHasher)
    .inSingletonScope();

  container
    .bind<ITokenGenerator>('ITokenGenerator')
    .to(JwtTokenGenerator)
    .inSingletonScope();

  container
    .bind<ILogger>('ILogger')
    .to(ConsoleLogger)
    .inSingletonScope();

  // Bind use cases
  container.bind(CreateUserUseCase).toSelf().inTransientScope();
  container.bind(LoginUserUseCase).toSelf().inTransientScope();
  container.bind(CreatePropertyUseCase).toSelf().inTransientScope();
  container.bind(ListPropertiesUseCase).toSelf().inTransientScope();

  // Bind controllers
  container.bind(AuthController).toSelf().inTransientScope();
  container.bind(PropertyController).toSelf().inTransientScope();

  return container;
}
