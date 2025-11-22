# References

## Clean Architecture

### Layer Separation
The application follows Clean Architecture with strict dependency rules:

```
Presentation → Application → Domain → Core
     ↓             ↓           ↓
Infrastructure Infrastructure  (No dependencies)
```

- **Core Layer**: Pure domain entities with no external dependencies
- **Domain Layer**: Repository and service interfaces
- **Application Layer**: Use cases containing business logic
- **Infrastructure Layer**: Concrete implementations (Prisma, external services)
- **Presentation Layer**: HTTP controllers, middleware, routes

### Dependency Injection with inversify
```typescript
// Required in tsconfig.json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}

// Required in server.ts (must be first import)
import 'reflect-metadata';
```

## Testing Strategy

### Test Organization
```
apps/backend/src/
├── application/
│   └── property/
│       ├── CreatePropertyUseCase.ts
│       └── CreatePropertyUseCase.unit.test.ts  # Unit tests next to use cases
└── __tests__/
    └── integration/      # Integration tests
        └── property.integration.test.ts
```

### Mock Factories
```typescript
import { ILogger } from '../domain/services';

export function createMockRepository<T>(): jest.Mocked<T> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  } as any;
}

export function createMockLogger(): jest.Mocked<ILogger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  };
}
```

## Railway Deployment

### Environment Variables
```env
# Database (Railway provides this)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server
PORT=${{PORT}}
NODE_ENV=production
LOG_LEVEL=info

# Authentication
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRY=7d

# Frontend (for CORS)
FRONTEND_URL=https://your-frontend.railway.app
```

### Database Migrations
Railway uses Flyway for production migrations. Convert Prisma migrations:

1. Generate Prisma migration: `npx prisma migrate dev --name feature_name`
2. Copy SQL to Flyway format: `migrations/V{number}__{name}.sql`
3. Commit both Prisma and Flyway migrations
4. Railway runs Flyway on deploy


## API Patterns

### RESTful Endpoints
```
GET    /api/resources         # List with pagination
GET    /api/resources/:id     # Get single resource
POST   /api/resources         # Create new resource
PUT    /api/resources/:id     # Update resource
DELETE /api/resources/:id     # Delete resource
```

### Response Format
```typescript
// Success - direct data return
res.status(200).json(property);

// Error - simple error message
res.status(400).json({ error: 'Validation failed' });

// With pagination metadata
res.status(200).json({
  items: properties,
  total: 100,
  page: 1,
  limit: 20
});
```

### Pagination
```typescript
interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

## Security Middleware

### Essential Security Setup
```typescript
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});
app.use('/api/auth/', authLimiter);
```

## Production Logging Strategy

### Current Implementation (ILogger Interface)
```typescript
// apps/backend/src/domain/services/ILogger.ts
export interface ILogger {
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, context?: object): void;
  debug(message: string, context?: object): void;
}

// apps/backend/src/infrastructure/services/ConsoleLogger.ts
export class ConsoleLogger implements ILogger {
  info(message: string, context?: object): void {
    console.log(message, context);
  }
  // ... other methods
}
```

### Railway Logging Requirements

For production deployment to Railway, you need:
- **Structured JSON output** - Railway aggregates JSON logs
- **Stdout/stderr** - Railway captures console output
- **No file logging** - Containers are ephemeral
- **Request correlation** - Track requests across services
- **Performance metrics** - Identify slow operations

### Recommended Logging Solutions

**Option 1: Pino (Recommended)**
- Fastest JSON logger
- Built for cloud deployments
- Low overhead

```bash
npm install pino pino-pretty
```

**Option 2: Winston**
- More features
- Heavier, more complex

**Option 3: Enhanced ConsoleLogger**
- Keep it simple with structured JSON

```typescript
export class StructuredConsoleLogger implements ILogger {
  info(message: string, context?: object): void {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
}
```

### Request Correlation Pattern
```typescript
// apps/backend/src/presentation/middleware/requestId.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

// Use in use cases:
this.logger.info('Creating resource', {
  requestId: req.headers['x-request-id'],
  userId: input.userId
});
```

### Performance Logging Pattern
```typescript
async execute(input: CreateResourceInput): Promise<Resource> {
  const start = Date.now();

  try {
    const resource = await this.repository.create(input);

    const duration = Date.now() - start;
    this.logger.info('Resource created', { resourceId: resource.id, duration });

    if (duration > 1000) {
      this.logger.warn('Slow operation', { operation: 'CreateResource', duration });
    }

    return resource;
  } catch (error) {
    this.logger.error('Failed to create resource', {
      error: error.message,
      stack: error.stack,
      userId: input.userId
    });
    throw error;
  }
}
```