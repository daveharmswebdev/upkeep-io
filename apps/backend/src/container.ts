import { Container } from 'inversify';

// Domain interfaces
import { IUserRepository, IPropertyRepository, IProfileRepository } from './domain/repositories';
import { IPersonRepository } from './domain/repositories/IPersonRepository';
import { ILeaseRepository } from './domain/repositories/ILeaseRepository';
import { IPasswordHasher, ITokenGenerator, ILogger } from './domain/services';

// Infrastructure implementations
import { PrismaUserRepository, PrismaPropertyRepository, PrismaProfileRepository } from './infrastructure/repositories';
import { PrismaPersonRepository } from './infrastructure/repositories/PrismaPersonRepository';
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
import { GetProfileUseCase, UpdateProfileUseCase } from './application/profile';
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
import { AddPetToLeaseUseCase } from './application/lease/AddPetToLeaseUseCase';
import { RemovePetFromLeaseUseCase } from './application/lease/RemovePetFromLeaseUseCase';

// Controllers
import { AuthController, PropertyController, ProfileController } from './presentation/controllers';
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

  container
    .bind<ILeaseRepository>('ILeaseRepository')
    .to(PrismaLeaseRepository)
    .inTransientScope();

  container
    .bind<IProfileRepository>('IProfileRepository')
    .to(PrismaProfileRepository)
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
  container.bind(AddPetToLeaseUseCase).toSelf().inTransientScope();
  container.bind(RemovePetFromLeaseUseCase).toSelf().inTransientScope();

  container.bind(GetProfileUseCase).toSelf().inTransientScope();
  container.bind(UpdateProfileUseCase).toSelf().inTransientScope();

  // Bind controllers
  container.bind(AuthController).toSelf().inTransientScope();
  container.bind(PropertyController).toSelf().inTransientScope();
  container.bind(LeaseController).toSelf().inTransientScope();
  container.bind(ProfileController).toSelf().inTransientScope();

  return container;
}
