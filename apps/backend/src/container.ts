import { Container } from 'inversify';

// Domain interfaces
import { IUserRepository, IPropertyRepository } from './domain/repositories';
import { IPersonRepository } from './domain/repositories/IPersonRepository';
// import { ITenantRepository } from './domain/repositories/ITenantRepository';
import { ILeaseRepository } from './domain/repositories/ILeaseRepository';
import { IPasswordHasher, ITokenGenerator, ILogger } from './domain/services';

// Infrastructure implementations
import { PrismaUserRepository, PrismaPropertyRepository } from './infrastructure/repositories';
import { PrismaPersonRepository } from './infrastructure/repositories/PrismaPersonRepository';
// import { PrismaTenantRepository } from './infrastructure/repositories/PrismaTenantRepository';
import { PrismaLeaseRepository } from './infrastructure/repositories/PrismaLeaseRepository';
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
// Tenant use cases commented out - Tenant entity replaced with Lease
// import {
//   CreateTenantUseCase,
//   ListTenantsUseCase,
//   GetTenantByIdUseCase,
//   UpdateTenantUseCase,
//   DeleteTenantUseCase,
//   ListTenantsByPropertyUseCase,
// } from './application/tenant';
import { CreateLeaseUseCase } from './application/lease/CreateLeaseUseCase';
import { GetLeaseByIdUseCase } from './application/lease/GetLeaseByIdUseCase';
import { UpdateLeaseUseCase } from './application/lease/UpdateLeaseUseCase';
import { DeleteLeaseUseCase } from './application/lease/DeleteLeaseUseCase';
import { ListLeasesUseCase } from './application/lease/ListLeasesUseCase';
import { ListLeasesByPropertyUseCase } from './application/lease/ListLeasesByPropertyUseCase';
import { AddLesseeToLeaseUseCase } from './application/lease/AddLesseeToLeaseUseCase';
import { RemoveLesseeFromLeaseUseCase } from './application/lease/RemoveLesseeFromLeaseUseCase';
import { AddOccupantToLeaseUseCase } from './application/lease/AddOccupantToLeaseUseCase';
import { RemoveOccupantFromLeaseUseCase } from './application/lease/RemoveOccupantFromLeaseUseCase';

// Controllers
import { AuthController, PropertyController } from './presentation/controllers';
// import { TenantController } from './presentation/controllers/TenantController';
import { LeaseController } from './presentation/controllers/LeaseController';

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

  // Tenant repository commented out - Tenant entity replaced with Lease
  // container
  //   .bind<ITenantRepository>('ITenantRepository')
  //   .to(PrismaTenantRepository)
  //   .inTransientScope();

  container
    .bind<ILeaseRepository>('ILeaseRepository')
    .to(PrismaLeaseRepository)
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

  // Tenant use cases commented out - Tenant entity replaced with Lease
  // container.bind(CreateTenantUseCase).toSelf().inTransientScope();
  // container.bind(ListTenantsUseCase).toSelf().inTransientScope();
  // container.bind(GetTenantByIdUseCase).toSelf().inTransientScope();
  // container.bind(UpdateTenantUseCase).toSelf().inTransientScope();
  // container.bind(DeleteTenantUseCase).toSelf().inTransientScope();
  // container.bind(ListTenantsByPropertyUseCase).toSelf().inTransientScope();

  container.bind(CreateLeaseUseCase).toSelf().inTransientScope();
  container.bind(GetLeaseByIdUseCase).toSelf().inTransientScope();
  container.bind(UpdateLeaseUseCase).toSelf().inTransientScope();
  container.bind(DeleteLeaseUseCase).toSelf().inTransientScope();
  container.bind(ListLeasesUseCase).toSelf().inTransientScope();
  container.bind(ListLeasesByPropertyUseCase).toSelf().inTransientScope();
  container.bind(AddLesseeToLeaseUseCase).toSelf().inTransientScope();
  container.bind(RemoveLesseeFromLeaseUseCase).toSelf().inTransientScope();
  container.bind(AddOccupantToLeaseUseCase).toSelf().inTransientScope();
  container.bind(RemoveOccupantFromLeaseUseCase).toSelf().inTransientScope();

  // Bind controllers
  container.bind(AuthController).toSelf().inTransientScope();
  container.bind(PropertyController).toSelf().inTransientScope();
  // container.bind(TenantController).toSelf().inTransientScope(); // Commented out - replaced with LeaseController
  container.bind(LeaseController).toSelf().inTransientScope();

  return container;
}
