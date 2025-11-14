# Upkeep.io - Property Management System

A full-stack property management application built with Clean Architecture principles, featuring maintenance tracking, expense management, and vendor coordination across a portfolio of rental properties.

## Architecture

### Clean Architecture + DDD

This project follows **Clean Architecture** with strict separation of concerns:

```
apps/backend/src/
├── core/           # Pure domain models (no external dependencies)
├── domain/         # Abstract interfaces (repositories, services)
├── application/    # Use cases (pure business logic, fully testable)
├── infrastructure/ # Concrete implementations (Prisma, Bcrypt, JWT)
├── presentation/   # HTTP layer (controllers, middleware, routes)
├── container.ts    # Dependency injection (inversify)
└── server.ts       # Entry point (imports reflect-metadata FIRST)
```

**Key Principles:**
- Domain entities never import from infrastructure or presentation
- Use cases depend only on domain interfaces, never concrete implementations
- All dependencies injected via inversify container
- Changing from Prisma to MongoDB requires zero changes to domain/application layers

## Tech Stack

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **Prisma** - Database ORM (local dev)
- **Flyway** - Migration management (production)
- **PostgreSQL** - Primary database
- **inversify** - Dependency injection
- **bcrypt** - Password hashing
- **JWT** - Authentication
- **Jest** - Testing

### Frontend
- **Vue 3** - UI framework
- **Vite** - Build tool
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client with JWT interceptors
- **TypeScript** - Type safety

### Infrastructure
- **Docker** - Containerization
- **Railway** - Hosting platform
- **GitHub Actions** - CI/CD
- **Redis** - Caching (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL (for local non-Docker setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd upkeep-io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your database credentials

   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Run database migrations**
   ```bash
   npm run migrate:dev --workspace=apps/backend
   ```

### Development

#### Option 1: Docker Compose (Recommended)

Run all services with a single command:

```bash
docker-compose up
```

- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:5173
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

#### Option 2: Local Development

Run backend and frontend separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only (use cases with mocked repositories)
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch --workspace=apps/backend
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

## Project Structure

```
upkeep-io/
├── apps/
│   ├── backend/              # Express API
│   │   ├── src/
│   │   │   ├── application/  # Use cases (CreateUser, Login, CreateProperty)
│   │   │   ├── domain/       # Interfaces (IUserRepository, IPasswordHasher)
│   │   │   ├── infrastructure/ # Implementations (PrismaUserRepository, BcryptPasswordHasher)
│   │   │   ├── presentation/ # Controllers, routes, middleware
│   │   │   ├── container.ts  # DI configuration
│   │   │   └── server.ts     # Entry point
│   │   ├── prisma/           # Database schema
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/             # Vue 3 app
│       ├── src/
│       │   ├── api/          # Axios client with JWT interceptor
│       │   ├── stores/       # Pinia stores (auth)
│       │   ├── router/       # Vue Router with protected routes
│       │   ├── views/        # Pages (Login, Signup, Dashboard)
│       │   ├── App.vue
│       │   └── main.ts
│       ├── Dockerfile
│       ├── nginx.conf
│       └── package.json
├── libs/
│   ├── domain/               # Shared entities (User, Property) and errors
│   ├── validators/           # Zod schemas for input validation
│   └── auth/                 # JWT utilities
├── migrations/               # Flyway SQL migrations for production
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml
├── package.json              # Workspace root
└── tsconfig.json             # Root TypeScript config with path aliases
```

## Domain Model

### Core Entities

- **User** - System users (property owners)
- **Property** - Rental properties with addresses and metadata
- **MaintenanceWork** - Central aggregate for tracking work, costs, and travel (planned)
- **WorkPerformer** - Tracks who did work (owner, family, vendor) and time (planned)
- **Vendor** - Reusable vendors (HVAC, plumbers, etc.) (planned)
- **Receipt** - Material purchases for tax deduction tracking (planned)
- **TravelActivity** - Mileage tracking for IRS deductions (planned)
- **RecurringService** - Scheduled vendor services (planned)

See `property-management-domain-model.md` for detailed specifications.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token

### Properties (Protected)
- `POST /api/properties` - Create a new property
- `GET /api/properties` - List all properties for authenticated user

## Environment Variables

### Backend (`apps/backend/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/upkeep_dev
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`apps/frontend/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

## Deployment

### Railway Setup

1. **Create Railway Project** with services:
   - PostgreSQL database
   - Backend (Node.js)
   - Frontend (Static)
   - Redis (optional)

2. **Configure Environment Variables** in Railway dashboard

3. **Set up GitHub Secrets:**
   - `RAILWAY_TOKEN`
   - `RAILWAY_DATABASE_URL`
   - `RAILWAY_DATABASE_USER`
   - `RAILWAY_DATABASE_PASSWORD`

4. **Push to main branch** - GitHub Actions will:
   - Run tests
   - Apply Flyway migrations
   - Deploy backend and frontend

## Database Migrations

### Local Development (Prisma)
```bash
# Create and apply migration
npm run migrate:dev --workspace=apps/backend

# Check migration status
npm run migrate:status --workspace=apps/backend

# Regenerate Prisma client
npm run generate --workspace=apps/backend
```

### Production (Flyway)
1. Update `apps/backend/prisma/schema.prisma`
2. Run `npm run migrate:dev` to generate Prisma migration
3. Copy generated SQL to `migrations/VXXX__description.sql`
4. Commit and push - GitHub Actions runs Flyway

## Testing Philosophy

- **Unit Tests** - Test use cases with mocked repositories (no database, no Express)
- **Integration Tests** - Test full request flow with real database
- Use cases in `application/` layer should have 100% coverage
- Controllers in `presentation/` layer should be thin

Example testable use case:
```typescript
// Fully testable without database
const mockRepo = { findById: jest.fn(), save: jest.fn() };
const useCase = new CreateUserUseCase(mockRepo, mockHasher, mockTokenGen);
const result = await useCase.execute({ email, password, name });
```

## Cost Budget

**Target: $100/month**
- Railway services: ~$35-45/month
- PostgreSQL, Redis, Backend, Frontend
- Leaves $55-65 for scaling

## Contributing

1. Create feature branch from `main`
2. Implement changes following Clean Architecture
3. Write unit tests for use cases
4. Ensure all tests pass: `npm test`
5. Create pull request

## License

Proprietary - All rights reserved

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vue 3 Documentation](https://vuejs.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [inversify Documentation](https://inversify.io/)
- [Railway Documentation](https://docs.railway.app/)
