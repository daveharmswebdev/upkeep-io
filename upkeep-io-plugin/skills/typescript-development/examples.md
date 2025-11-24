# Examples

## Creating a Maintenance Tracking Feature

This example shows how to add a complete maintenance tracking feature following Clean Architecture patterns.

### 1. Define the Domain Entity

```typescript
// libs/domain/src/entities/MaintenanceWork.ts
export interface CreateMaintenanceWorkData {
  userId: string;
  propertyId: string;
  description: string;
  status?: 'pending' | 'in-progress' | 'completed';
  scheduledDate?: Date;
  cost?: number;
}

export interface MaintenanceWork extends CreateMaintenanceWorkData {
  id: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Create Repository Interface

```typescript
// apps/backend/src/domain/repositories/IMaintenanceWorkRepository.ts
import { MaintenanceWork, CreateMaintenanceWorkData } from '@domain/entities';

export interface IMaintenanceWorkRepository {
  create(data: CreateMaintenanceWorkData): Promise<MaintenanceWork>;
  findById(id: string): Promise<MaintenanceWork | null>;
  findByPropertyId(propertyId: string): Promise<MaintenanceWork[]>;
  update(id: string, data: Partial<CreateMaintenanceWorkData>): Promise<MaintenanceWork>;
  delete(id: string): Promise<void>;
}
```

### 3. Implement Use Case

```typescript
// apps/backend/src/application/maintenance/CreateMaintenanceWorkUseCase.ts
import { injectable, inject } from 'inversify';
import { IMaintenanceWorkRepository } from '../../domain/repositories/IMaintenanceWorkRepository';
import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { ILogger } from '../../domain/services';
import { ValidationError, NotFoundError } from '@domain/errors';
import { createMaintenanceWorkSchema } from '@validators/maintenance';
import { MaintenanceWork } from '@domain/entities';

export interface CreateMaintenanceWorkInput {
  userId: string;
  propertyId: string;
  description: string;
  scheduledDate?: string;
  cost?: number;
}

@injectable()
export class CreateMaintenanceWorkUseCase {
  constructor(
    @inject('IMaintenanceWorkRepository')
    private maintenanceRepository: IMaintenanceWorkRepository,
    @inject('IPropertyRepository')
    private propertyRepository: IPropertyRepository,
    @inject('ILogger')
    private logger: ILogger
  ) {}

  async execute(input: CreateMaintenanceWorkInput): Promise<MaintenanceWork> {
    this.logger.info('Creating maintenance work', {
      userId: input.userId,
      propertyId: input.propertyId
    });

    // Validate input
    const validation = createMaintenanceWorkSchema.safeParse(input);
    if (!validation.success) {
      this.logger.warn('Validation failed', { errors: validation.error.errors });
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Verify property exists and user owns it
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }
    if (property.userId !== input.userId) {
      throw new ValidationError('You do not own this property');
    }

    // Create maintenance work
    const maintenanceWork = await this.maintenanceRepository.create({
      ...validation.data,
      scheduledDate: validation.data.scheduledDate
        ? new Date(validation.data.scheduledDate)
        : undefined,
      status: 'pending'
    });

    this.logger.info('Maintenance work created', {
      maintenanceWorkId: maintenanceWork.id
    });

    return maintenanceWork;
  }
}
```

### 4. Create Prisma Schema

```prisma
// prisma/schema.prisma
model MaintenanceWork {
  id            String    @id @default(uuid())
  userId        String
  propertyId    String
  description   String
  status        String    @default("pending")
  scheduledDate DateTime?
  completedDate DateTime?
  cost          Decimal?  @db.Decimal(10, 2)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  property      Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  performers    WorkPerformer[]
  
  @@index([userId])
  @@index([propertyId])
  @@index([status])
}
```

### 5. Implement Prisma Repository

```typescript
// apps/backend/src/infrastructure/repositories/PrismaMaintenanceWorkRepository.ts
import { injectable } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { IMaintenanceWorkRepository } from '../../domain/repositories/IMaintenanceWorkRepository';
import { MaintenanceWork, CreateMaintenanceWorkData } from '@domain/entities';

@injectable()
export class PrismaMaintenanceWorkRepository implements IMaintenanceWorkRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreateMaintenanceWorkData): Promise<MaintenanceWork> {
    const result = await this.prisma.maintenanceWork.create({
      data: {
        ...data,
        cost: data.cost ? new Prisma.Decimal(data.cost) : undefined
      }
    });

    // Transform Prisma types to domain types
    return {
      ...result,
      scheduledDate: result.scheduledDate ?? undefined,
      completedDate: result.completedDate ?? undefined,
      cost: result.cost ? result.cost.toNumber() : undefined
    };
  }

  async findById(id: string): Promise<MaintenanceWork | null> {
    const result = await this.prisma.maintenanceWork.findUnique({
      where: { id }
    });

    if (!result) return null;

    return {
      ...result,
      scheduledDate: result.scheduledDate ?? undefined,
      completedDate: result.completedDate ?? undefined,
      cost: result.cost ? result.cost.toNumber() : undefined
    };
  }

  async findByPropertyId(propertyId: string): Promise<MaintenanceWork[]> {
    const results = await this.prisma.maintenanceWork.findMany({
      where: { propertyId },
      orderBy: { scheduledDate: 'asc' }
    });

    return results.map(r => ({
      ...r,
      scheduledDate: r.scheduledDate ?? undefined,
      completedDate: r.completedDate ?? undefined,
      cost: r.cost ? r.cost.toNumber() : undefined
    }));
  }

  async update(id: string, data: Partial<CreateMaintenanceWorkData>): Promise<MaintenanceWork> {
    const result = await this.prisma.maintenanceWork.update({
      where: { id },
      data: {
        ...data,
        cost: data.cost ? new Prisma.Decimal(data.cost) : undefined
      }
    });

    return {
      ...result,
      scheduledDate: result.scheduledDate ?? undefined,
      completedDate: result.completedDate ?? undefined,
      cost: result.cost ? result.cost.toNumber() : undefined
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.maintenanceWork.delete({
      where: { id }
    });
  }
}
```

### 6. Register in Container

```typescript
// apps/backend/src/container.ts
import { IMaintenanceWorkRepository } from './domain/repositories/IMaintenanceWorkRepository';
import { PrismaMaintenanceWorkRepository } from './infrastructure/repositories/PrismaMaintenanceWorkRepository';
import { CreateMaintenanceWorkUseCase } from './application/maintenance/CreateMaintenanceWorkUseCase';
import { MaintenanceWorkController } from './presentation/controllers/MaintenanceWorkController';

export function createContainer(): Container {
  const container = new Container();

  // ... existing bindings ...

  // Repository
  container
    .bind<IMaintenanceWorkRepository>('IMaintenanceWorkRepository')
    .to(PrismaMaintenanceWorkRepository)
    .inTransientScope();

  // Use Cases
  container.bind(CreateMaintenanceWorkUseCase).toSelf().inTransientScope();

  // Controller
  container.bind(MaintenanceWorkController).toSelf().inTransientScope();

  return container;
}
```

### 7. Create Controller

```typescript
// apps/backend/src/presentation/controllers/MaintenanceWorkController.ts
import { injectable, inject } from 'inversify';
import { Response, NextFunction } from 'express';
import { CreateMaintenanceWorkUseCase } from '../../application/maintenance/CreateMaintenanceWorkUseCase';
import { AuthRequest } from '../middleware';

@injectable()
export class MaintenanceWorkController {
  constructor(
    @inject(CreateMaintenanceWorkUseCase)
    private createUseCase: CreateMaintenanceWorkUseCase
  ) {}

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const maintenanceWork = await this.createUseCase.execute({
        ...req.body,
        userId: req.user.userId
      });

      res.status(201).json(maintenanceWork);
    } catch (error) {
      next(error);
    }
  }
}
```

### 8. Add Routes

```typescript
// apps/backend/src/presentation/routes/maintenance.routes.ts
import { Router } from 'express';
import { Container } from 'inversify';
import { MaintenanceWorkController } from '../controllers/MaintenanceWorkController';
import { authenticate } from '../middleware/auth';

export function createMaintenanceRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get(MaintenanceWorkController);

  router.use(authenticate); // Require authentication for all routes

  router.post('/', (req, res, next) => controller.create(req, res, next));
  // Add other routes as needed

  return router;
}

// In main routes file (apps/backend/src/server.ts)
app.use('/api/maintenance-works', createMaintenanceRoutes(container));
```

### 9. Write Tests

```typescript
// apps/backend/src/application/maintenance/CreateMaintenanceWorkUseCase.unit.test.ts
import { CreateMaintenanceWorkUseCase } from './CreateMaintenanceWorkUseCase';
import { IMaintenanceWorkRepository } from '../../domain/repositories/IMaintenanceWorkRepository';
import { IPropertyRepository } from '../../domain/repositories/IPropertyRepository';
import { ILogger } from '../../domain/services';
import { ValidationError, NotFoundError } from '@domain/errors';
import { MaintenanceWork, Property } from '@domain/entities';

describe('CreateMaintenanceWorkUseCase', () => {
  let useCase: CreateMaintenanceWorkUseCase;
  let mockMaintenanceRepo: jest.Mocked<IMaintenanceWorkRepository>;
  let mockPropertyRepo: jest.Mocked<IPropertyRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockMaintenanceRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPropertyId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockPropertyRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    useCase = new CreateMaintenanceWorkUseCase(
      mockMaintenanceRepo,
      mockPropertyRepo,
      mockLogger
    );
  });

  it('should create maintenance work for owned property', async () => {
    const input = {
      userId: 'user-123',
      propertyId: 'property-456',
      description: 'Fix leaking faucet',
      scheduledDate: '2024-12-01'
    };

    const property: Property = {
      id: 'property-456',
      userId: 'user-123',
      street: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zipCode: '94102',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const expected: MaintenanceWork = {
      id: 'maintenance-789',
      userId: input.userId,
      propertyId: input.propertyId,
      description: input.description,
      status: 'pending',
      scheduledDate: new Date(input.scheduledDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPropertyRepo.findById.mockResolvedValue(property);
    mockMaintenanceRepo.create.mockResolvedValue(expected);

    const result = await useCase.execute(input);

    expect(result).toEqual(expected);
    expect(mockPropertyRepo.findById).toHaveBeenCalledWith('property-456');
    expect(mockMaintenanceRepo.create).toHaveBeenCalled();
  });

  it('should throw error if property not found', async () => {
    const input = {
      userId: 'user-123',
      propertyId: 'non-existent',
      description: 'Fix something'
    };

    mockPropertyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(input))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw error if user does not own property', async () => {
    const input = {
      userId: 'user-123',
      propertyId: 'property-456',
      description: 'Fix something'
    };

    const property: Property = {
      id: 'property-456',
      userId: 'different-user',
      street: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zipCode: '94102',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPropertyRepo.findById.mockResolvedValue(property);

    await expect(useCase.execute(input))
      .rejects.toThrow(ValidationError);
  });
});
```

