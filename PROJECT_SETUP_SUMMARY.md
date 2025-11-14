# Side Project Setup Summary

## Context
- **Your role**: Full-stack dev at Fortune 100 company
- **Current work stack**: K8s, Node/Express, Vue, Postgres, GitOps, CI/CD (GitHub Actions), GCP
- **Goal**: Build a side project to sharpen DevOps and full-stack skills
- **Budget**: $100/month
- **Tooling**: Using Claude Code (5x max plan)

## Key Decision: Skip Blazor, Go Full-Stack Node/Vue

**Why not Blazor?**
- Blazor Server uses monolithic, stateful WebSocket architecture
- Doesn't align with your professional stack (K8s, Node/Express, Vue)
- Better to stay sharp on what you use daily at work

**Why Node/Express + Vue + Postgres?**
- Direct skill transfer to your Fortune 100 role
- Practices containerization, CI/CD, cloud deployment
- Mirrors modern microservices patterns you work with
- DevOps learning is more relevant to your career

## Infrastructure Decision: Railway

### Why Railway Over Render

**Cost Efficiency**
- Railway: $35-45/month for full stack (leaves $55-65 for experimentation)
- Render: $60-70/month for same stack (leaves $30-40)
- Railway's usage-based billing stretches your budget 2x farther

**Budget Breakdown (Railway)**
- Express API: $3-5/month
- Vue frontend: $2-3/month
- PostgreSQL (10GB): $2-3/month
- Redis (caching): $5-8/month
- **Total**: ~$15-20/month for basic setup

**Features Both Platforms Share**
- GitHub Actions integration for CI/CD
- Docker support
- Auto-deploy on git push
- Zero-downtime deploys
- Instant rollback
- PostgreSQL + Redis support
- Private networking between services

**Advantages of Railway**
- Usage-based pricing (variable workloads cost less)
- Automatic scaling based on actual usage
- Real-time collaborative infrastructure dashboard
- Faster deployments (2-3 min vs 3-5 min on Render)
- Better UX for viewing logs and metrics

**Advantages of Render** (not chosen, but good to know)
- Fixed predictable costs
- Built-in background job workers and cron jobs
- More opinionated production defaults
- Better for always-on services

### Railway Setup Steps
1. Create monorepo with `backend/`, `frontend/`, `migrations/` folders
2. Docker setup: Dockerfile for each service + docker-compose for local dev
3. Push to GitHub
4. GitHub Actions workflow builds and deploys to Railway on push
5. Configure environment variables and database connection strings
6. Deploy Postgres and Redis as managed services on Railway

## Architecture Decision: Clean Architecture + inversify DI + Prisma + Flyway

### Clean Architecture Layers

Your backend follows domain-driven, SOLID principles:

```
src/
├── core/                      # Domain models, no dependencies
│   ├── entities/              # Property, MaintenanceWork, User, etc.
│   └── errors/                # DomainError, ValidationError, NotFoundError
├── domain/                    # Abstract boundaries (interfaces)
│   ├── repositories/          # IMaintenanceWorkRepository, IUserRepository
│   └── services/              # IPasswordHasher, ITokenGenerator, ILogger
├── application/               # Use cases (business logic, testable)
│   ├── auth/                  # CreateUserUseCase, LoginUserUseCase
│   └── maintenance/           # CreateMaintenanceWorkUseCase, etc.
├── infrastructure/            # Implementations (DB, external APIs)
│   ├── repositories/          # PrismaMaintenanceWorkRepository
│   └── services/              # BcryptPasswordHasher, JwtTokenGenerator
├── presentation/              # HTTP layer (thin)
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── container.ts               # inversify DI setup
└── server.ts                  # Entry point
```

### Data Access & Migrations: Prisma + Flyway

#### Why This Combination

**Prisma (Development & Local)**
- Schema-first approach (source of truth for your data model)
- Auto-generates type-safe TypeScript client from schema
- Smooth `prisma migrate dev` workflow locally
- Generates SQL migrations automatically
- Works beautifully with inversify repositories for Clean Architecture
- Handles complex nested reads/writes (critical for MaintenanceWork → WorkPerformer → Vendor relationships)

**Flyway (Production on Railway)**
- Language-agnostic migration runner (just SQL files, no Node.js dependency)
- Battle-tested, enterprise-grade reliability (proven at Fortune 500 companies)
- Atomic migrations (all-or-nothing, transactional)
- Instant rollback capability via Railway deployment revert
- Runs in Docker before app starts (migrates DB before code runs)
- Railway-friendly with no special configuration needed
- Tracks applied migrations in `flyway_schema_history` table

#### Local Development Workflow

```bash
# Make domain changes to your property-management model
# Update prisma/schema.prisma with new fields/relations
# Then run:
prisma migrate dev --name "add_tenant_notes"

# Automatically:
# 1. Creates prisma/migrations/TIMESTAMP_add_tenant_notes/migration.sql
# 2. Applies migration to local dev database
# 3. Regenerates Prisma client types (TypeScript stays in sync)
# 4. Ready to commit both schema and migration files
```

#### Production Deployment (Railway)

GitHub Actions runs Flyway before app deployment:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Database Migrations (Flyway)
        env:
          FLYWAY_URL: ${{ secrets.DATABASE_URL }}
          FLYWAY_USER: ${{ secrets.DB_USER }}
          FLYWAY_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: |
          docker run --rm \
            -v ${{ github.workspace }}/migrations:/flyway/sql \
            -e FLYWAY_URL=$FLYWAY_URL \
            -e FLYWAY_USER=$FLYWAY_USER \
            -e FLYWAY_PASSWORD=$FLYWAY_PASSWORD \
            flyway/flyway:latest migrate
      
      - name: Build & Deploy Express API
        # ... standard Docker build and Railway push
```

Result: Migrations are atomic, tracked in version control, and reversible. Database always in sync with code.

#### Repository Pattern with Prisma + inversify

Your repositories wrap Prisma client—domain logic stays completely decoupled:

```typescript
// src/domain/repositories/IMaintenanceWorkRepository.ts
export interface IMaintenanceWorkRepository {
  findById(id: string): Promise<MaintenanceWork | null>;
  findByPropertyId(propertyId: string): Promise<MaintenanceWork[]>;
  save(work: MaintenanceWork): Promise<void>;
}

// src/infrastructure/repositories/PrismaMaintenanceWorkRepository.ts
@injectable()
export class PrismaMaintenanceWorkRepository implements IMaintenanceWorkRepository {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<MaintenanceWork | null> {
    const raw = await this.prisma.maintenanceWork.findUnique({
      where: { id },
      include: {
        property: true,
        workPerformedBy: { include: { vendor: true } },
        materialReceipts: true,
        travelActivities: true
      }
    });
    return raw ? this.toDomain(raw) : null;
  }

  async save(work: MaintenanceWork): Promise<void> {
    await this.prisma.maintenanceWork.upsert({
      where: { id: work.id },
      update: work.toPersistence(),
      create: work.toPersistence()
    });
  }

  private toDomain(raw: Prisma.MaintenanceWorkUncheckedCreateInput): MaintenanceWork {
    return MaintenanceWork.create(raw.propertyId, raw.title, raw.description);
  }
}

// src/container.ts (inversify DI composition root)
const container = new Container();

container
  .bind(PrismaClient)
  .toConstantValue(new PrismaClient())
  .inSingletonScope();

container
  .bind<IMaintenanceWorkRepository>('IMaintenanceWorkRepository')
  .to(PrismaMaintenanceWorkRepository)
  .inTransientScope();
```

Benefits:
- Test use cases with mocked repositories (no Prisma involved)
- Swap repository implementation without touching domain logic
- Future migration? Write `MongoMaintenanceWorkRepository`, rebind container, done

#### Backend package.json Scripts

```json
{
  "scripts": {
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:status": "prisma migrate status",
    "generate": "prisma generate",
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@prisma/client": "^5.8.0",
    "inversify": "^6.0.1",
    "reflect-metadata": "^0.1.13",
    "express": "^4.18.2",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.1.0",
    "pg": "^8.10.0",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "typescript": "^5.2.2",
    "@types/express": "^4.17.20",
    "@types/node": "^20.6.0",
    "@types/jest": "^29.5.5",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1"
  }
}
```

#### TypeScript Configuration

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "lib": ["ES2020"],
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Authentication Decision: JWT + Password

### Why JWT + Password (Not GCP IAM)

**GCP IAM Issues for This Project**
- Enterprise-grade but overkill for side project
- Adds credential/keyfile complexity
- Doesn't teach portable patterns
- GCP IAM manages infrastructure access, not user authentication
- Not aligned with patterns you'd use on other platforms

**Why JWT + Password is Better for Learning**
- You control the entire auth flow
- Learn token-based authentication fundamentals
- Teaches session management, password hashing, token validation
- Real-world approach used everywhere (Firebase, Auth0, custom APIs)
- Legitimate production pattern, not a toy approach
- Mirrors backend auth patterns your Fortune 100 company uses

### JWT + Password Architecture

```
User -> Vue Frontend (login form)
   |
   v
Express Backend (POST /auth/login)
   |
   v
Validate email + password against Postgres
   |
   v
Hash password with bcrypt
   |
   v
Issue JWT token
   |
   v
Vue Frontend (store JWT in localStorage)
   |
   v
Include JWT in Authorization header on all API requests
   |
   v
Express middleware validates JWT on protected routes
   |
   v
If valid -> process request
If invalid -> redirect to login
```

## Project Structure

```
parent-folder/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Source of truth (your domain model)
│   │   ├── migrations/                # Prisma-generated migrations (local)
│   │   └── seed.ts                    # Reference data seeding (optional)
│   ├── src/
│   │   ├── core/
│   │   │   ├── entities/              # Domain models
│   │   │   └── errors/
│   │   ├── domain/
│   │   │   ├── repositories/          # Repository interfaces
│   │   │   └── services/              # Service interfaces
│   │   ├── application/               # Use cases
│   │   ├── infrastructure/
│   │   │   └── repositories/          # Prisma implementations
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── routes/
│   │   ├── container.ts               # inversify composition root
│   │   └── server.ts                  # Entry point
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── auth/
│   ├── Dockerfile
│   └── package.json
├── migrations/                         # Flyway migrations (Railway production)
│   ├── V1__init.sql
│   ├── V2__add_maintenance_work.sql
│   └── ...
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml                 # Runs Flyway before app deploy
├── .env.example
└── .gitignore
```

## Claude Code Workflow

### Starting Point
```bash
claude code .
# From parent folder to work across entire monorepo
```

### First Claude Code Prompt (Recommended)

```
"Create a full monorepo with Clean Architecture, Prisma, and inversify:

BACKEND STRUCTURE (TypeScript + Express):
- Use inversify for dependency injection (like C# attribute patterns)
- Organize by domain concern, NOT HTTP routes:
  * src/core/entities/ - Domain models (User, Property, MaintenanceWork, WorkPerformer, Vendor, Receipt, TravelActivity)
  * src/core/errors/ - DomainError, ValidationError, NotFoundError
  * src/domain/repositories/ - IMaintenanceWorkRepository, IUserRepository interfaces
  * src/domain/services/ - IPasswordHasher, ITokenGenerator, ILogger interfaces
  * src/application/ - Use cases (CreateUserUseCase, LoginUserUseCase, CreateMaintenanceWorkUseCase)
    - All use case tests can run WITHOUT Express or database (inject mocked repositories)
  * src/infrastructure/repositories/ - PrismaMaintenanceWorkRepository, PrismaUserRepository implementations
  * src/presentation/ - Thin HTTP layer (UserController, MaintenanceWorkController)
  * src/container.ts - inversify composition root
  * src/server.ts - Entry point (imports reflect-metadata FIRST)

DATABASE (Prisma + Flyway):
- prisma/schema.prisma with all models: Property, Address, Tenant, MaintenanceWork, WorkPerformer, Vendor, Receipt, TravelActivity
- prisma/migrations/ (auto-generated by prisma migrate dev)
- migrations/ directory with Flyway format (V1__init.sql, V2__*.sql)
  * Copy/convert migrations from prisma/migrations to migrations/ for Railway
- TypeScript config with experimentalDecorators: true, emitDecoratorMetadata: true

AUTHENTICATION (JWT + Password):
- POST /auth/signup (CreateUserUseCase validates, hashes password with bcrypt, saves User, returns JWT)
- POST /auth/login (LoginUserUseCase validates credentials, returns JWT)
- GET /api/protected (JWT middleware validates Authorization header)
- Use cases contain business logic, controllers just route HTTP

FRONTEND (Vue 3):
- Login/signup pages
- Store JWT in localStorage
- Include JWT in Authorization header (axios interceptor)
- Protected routes redirect to login if no token
- Logout clears token

DOCKER & LOCAL DEV:
- backend/Dockerfile (TypeScript build, express server)
- frontend/Dockerfile (Vue build, nginx server)
- docker-compose.yml with postgres, redis, backend, frontend
- Can run 'docker-compose up' and everything works immediately

CI/CD (GitHub Actions + Railway):
- .github/workflows/deploy.yml
- Run Flyway migrations BEFORE app deploys (Docker Flyway container)
- Build Docker images for backend and frontend
- Deploy to Railway on push to main

Key Details:
1. Use cases testable without Express/database (inject mocks)
2. Changing PrismaUserRepository to MongoUserRepository requires no domain/application changes
3. Business logic in application/ layer, HTTP concerns in presentation/
4. Inversify container handles all dependency injection
5. Middleware handles auth, use cases handle domain logic
6. All domain models in core/entities/, no Prisma imports there
7. docker-compose up works immediately with all services connected
"
```

### Service-Specific Work
- Once skeleton is built, can do `cd backend && claude code .` for specific service work
- Or stay at parent level and have Claude work across all services

## DevOps Skills You'll Practice

✅ **Containerization** - Docker for Express and Vue
✅ **Local Development** - docker-compose
✅ **CI/CD Pipelines** - GitHub Actions with Flyway migrations
✅ **Infrastructure as Code** - Railway deployment
✅ **Environment Management** - .env files, secrets
✅ **Database Management** - Postgres schema, Prisma migrations, Flyway
✅ **Caching** - Redis integration
✅ **Authentication** - JWT tokens, password hashing with bcrypt
✅ **Clean Architecture** - SOLID principles, inversify DI
✅ **ORM + Migrations** - Prisma for development, Flyway for production
✅ **Multi-service deployment** - Backend, frontend, database coordination

All directly transferable to your Fortune 100 K8s/Node stack.

## Next Steps

1. Create GitHub repo with parent folder structure
2. Start Claude Code from parent folder
3. Use the prompt above to scaffold entire project
4. Test locally with `docker-compose up`
5. Set up Railway account and configure GitHub Actions
6. Deploy to Railway
7. Iterate on features and learn as you build

## Learning Path

**Phase 1**: Get MVP working locally
**Phase 2**: Deploy to Railway with GitHub Actions (including Flyway migrations)
**Phase 3**: Add property-management features (MaintenanceWork, Vendors)
**Phase 4**: Add caching layer (Redis) for API responses
**Phase 5**: Add OAuth (GitHub login) to learn OAuth flows
**Phase 6**: Implement background jobs for async tasks
**Phase 7**: Add monitoring and alerts

Each phase reinforces DevOps patterns you use at work.
