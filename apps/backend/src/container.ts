import { Container } from 'inversify';

// Domain interfaces
import { IUserRepository, IPropertyRepository } from './domain/repositories';
import { IPersonRepository } from './domain/repositories/IPersonRepository';
import { ITenantRepository } from './domain/repositories/ITenantRepository';
import { IPasswordHasher, ITokenGenerator, ILogger } from './domain/services';

// Infrastructure implementations
import { PrismaUserRepository, PrismaPropertyRepository } from './infrastructure/repositories';
import { PrismaPersonRepository } from './infrastructure/repositories/PrismaPersonRepository';
import { PrismaTenantRepository } from './infrastructure/repositories/PrismaTenantRepository';
import { BcryptPasswordHasher, JwtTokenGenerator, ConsoleLogger } from './infrastructure/services';

// Use cases
import { CreateUserUseCase, LoginUserUseCase } from './application/auth';
import {
  CreatePropertyUseCase,
  ListPropertiesUseCase,
  GetPropertyByIdUseCase,
  UpdatePropertyUseCase,
  DeletePropertyUseCase,
} from './application/property';
import {
  CreateTenantUseCase,
  ListTenantsUseCase,
  GetTenantByIdUseCase,
  UpdateTenantUseCase,
  DeleteTenantUseCase,
  ListTenantsByPropertyUseCase,
} from './application/tenant';

// Controllers
import { AuthController, PropertyController } from './presentation/controllers';
import { TenantController } from './presentation/controllers/TenantController';

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

  container
    .bind<IPersonRepository>('IPersonRepository')
    .to(PrismaPersonRepository)
    .inTransientScope();

  container
    .bind<ITenantRepository>('ITenantRepository')
    .to(PrismaTenantRepository)
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
  container.bind(GetPropertyByIdUseCase).toSelf().inTransientScope();
  container.bind(UpdatePropertyUseCase).toSelf().inTransientScope();
  container.bind(DeletePropertyUseCase).toSelf().inTransientScope();

  container.bind(CreateTenantUseCase).toSelf().inTransientScope();
  container.bind(ListTenantsUseCase).toSelf().inTransientScope();
  container.bind(GetTenantByIdUseCase).toSelf().inTransientScope();
  container.bind(UpdateTenantUseCase).toSelf().inTransientScope();
  container.bind(DeleteTenantUseCase).toSelf().inTransientScope();
  container.bind(ListTenantsByPropertyUseCase).toSelf().inTransientScope();

  // Bind controllers
  container.bind(AuthController).toSelf().inTransientScope();
  container.bind(PropertyController).toSelf().inTransientScope();
  container.bind(TenantController).toSelf().inTransientScope();

  return container;
}
