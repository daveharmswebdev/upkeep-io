# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Property management system for tracking maintenance activities, expenses, and vendors across a portfolio of rental properties. Built with Clean Architecture principles using Node/Express backend, Vue 3 frontend, PostgreSQL database, and deployed on Railway.

## Architecture

### Monorepo Structure

The project uses npm workspaces with shared libraries for maximum code reuse:

```
upkeep-io/
├── apps/
│   ├── backend/              # Node/Express API
│   └── frontend/             # Vue 3 SPA
└── libs/                     # Shared libraries
    ├── domain/               # Entities, errors (Property, MaintenanceWork, User)
    ├── validators/           # Zod schemas (shared between frontend & backend)
    └── auth/                 # JWT utilities
```

**DRY Principle Implementation:**
- Validation schemas in `@validators/*` used by both VeeValidate (frontend) and use cases (backend)
- Domain entities in `@domain/*` shared across all layers
- TypeScript path aliases (`@domain/*`, `@validators/*`, `@auth/*`) configured in both apps
- Single source of truth for types and validation rules

### Clean Architecture Layers

The backend follows domain-driven design with strict separation of concerns:

```
apps/backend/src/
├── core/                      # Pure domain models, no external dependencies
│   ├── entities/              # Property, MaintenanceWork, Vendor, WorkPerformer, Receipt, TravelActivity
│   └── errors/                # DomainError, ValidationError, NotFoundError
├── domain/                    # Abstract boundaries (interfaces only)
│   ├── repositories/          # IPropertyRepository, IMaintenanceWorkRepository, IUserRepository
│   └── services/              # IPasswordHasher, ITokenGenerator, ILogger
├── application/               # Use cases - pure business logic, fully testable without Express/DB
│   ├── auth/                  # CreateUserUseCase, LoginUserUseCase
│   ├── property/              # CreatePropertyUseCase, GetPropertyByIdUseCase, UpdatePropertyUseCase, DeletePropertyUseCase, ListPropertiesUseCase
│   ├── maintenance/           # CreateMaintenanceWorkUseCase, AddWorkPerformerUseCase
│   └── vendor/                # CreateVendorUseCase, ListVendorsUseCase
├── infrastructure/            # Concrete implementations
│   ├── repositories/          # PrismaPropertyRepository, PrismaMaintenanceWorkRepository, PrismaUserRepository
│   └── services/              # BcryptPasswordHasher, JwtTokenGenerator
├── presentation/              # HTTP layer (thin controllers, middleware, routes)
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── container.ts               # inversify DI composition root
└── server.ts                  # Entry point (must import reflect-metadata FIRST)
```

**Critical Architectural Rules:**
- Domain entities in `core/` NEVER import from infrastructure or presentation layers
- Use cases in `application/` depend only on domain interfaces, never concrete implementations
- All dependencies are injected via inversify container
- Repositories abstract all database operations - use cases remain testable with mocked repositories
- Changing from Prisma to MongoDB should require zero changes to domain/application layers
- Frontend imports shared validators and types from `libs/` - backend API contract is source of truth

### Dependency Injection (inversify)

This project uses **inversify** for dependency injection to enable Clean Architecture:

```typescript
// TypeScript config MUST have these for inversify decorators:
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}

// server.ts MUST import reflect-metadata FIRST:
import 'reflect-metadata';
```

Example repository binding:
```typescript
container
  .bind<IMaintenanceWorkRepository>('IMaintenanceWorkRepository')
  .to(PrismaMaintenanceWorkRepository)
  .inTransientScope();
```

### Database: Prisma (Dev) + Flyway (Production)

**Local Development:**
- Prisma schema (`prisma/schema.prisma`) is source of truth
- Run `npm run migrate:dev` to generate and apply migrations locally
- Prisma auto-generates TypeScript client with full type safety

**Production (Railway):**
- Flyway runs migrations BEFORE app deployment via GitHub Actions
- Copy Prisma-generated SQL from `prisma/migrations/` to `migrations/` folder in Flyway format (`V1__init.sql`, `V2__add_vendors.sql`)
- Flyway provides atomic, transactional migrations with rollback capability

**Migration Workflow:**
1. Update `prisma/schema.prisma`
2. Run `prisma migrate dev --name "descriptive_name"`
3. Copy generated SQL to `migrations/VXXX__descriptive_name.sql` for Flyway
4. Commit both prisma schema and migration files
5. Push to GitHub - CI/CD runs Flyway, then deploys app

## Domain Model

Core entities represent maintenance workflows for rental properties:

- **Property** - Rental properties with addresses
- **MaintenanceWork** - Central entity tying together all work, costs, and travel
- **WorkPerformer** - Tracks who did work (owner, family, or vendor) and time spent
- **Vendor** - Reusable vendors (HVAC companies, plumbers, etc.)
- **Receipt** - Material purchases from stores (tax deduction tracking)
- **TravelActivity** - Mileage tracking for IRS deductions
- **RecurringService** - Scheduled vendor services (HVAC twice yearly, etc.)
- **Tenant** - Current/past tenants linked to properties

See `property-management-domain-model.md` for detailed entity relationships and use cases.

## Development Commands

### Backend (Node/Express + Prisma)

```bash
# Database migrations
npm run migrate:dev          # Create and apply migration locally
npm run migrate:deploy       # Apply migrations (production)
npm run migrate:status       # Check migration status
npm run generate             # Regenerate Prisma client after schema changes

# Development
npm run dev                  # Start dev server with ts-node
npm run build                # Compile TypeScript to dist/
npm run start                # Run production build

# Testing
npm test                     # Run all tests
npm test:watch               # Run tests in watch mode
npm run test:unit            # Unit tests (use cases with mocked repos)
npm run test:integration     # Integration tests (with real DB)
```

### Frontend (Vue 3)

```bash
npm run dev                  # Start Vite dev server
npm run build                # Production build
npm run preview              # Preview production build locally
npm run lint                 # Run ESLint
npm run type-check           # TypeScript type checking
```

**Styling (Tailwind CSS v3):**
- Custom color palette: `primary` (red), `secondary-1` (orange/brown), `secondary-2` (teal), `complement` (green) - each with 100-500 shades
- Custom fonts: `font-heading` (Montserrat), `font-sans` (Lato - default)
- Configuration: `tailwind.config.js`, `postcss.config.js`
- Global styles: `src/assets/styles/main.css`

### Docker (Local Development)

```bash
docker-compose up            # Start all services (postgres, redis, backend, frontend)
docker-compose up -d         # Start in background
docker-compose down          # Stop all services
docker-compose logs -f       # Follow logs from all services
docker-compose ps            # Check running services
```

## Authentication

Uses **JWT + bcrypt password hashing** (not OAuth or GCP IAM):

- `POST /auth/signup` - CreateUserUseCase validates, hashes password, returns JWT
- `POST /auth/login` - LoginUserUseCase validates credentials, returns JWT
- Frontend stores JWT in localStorage, includes in Authorization header via axios interceptor
- JWT middleware validates token on protected routes

## Testing Philosophy

- **Unit tests:** Test use cases with mocked repositories (no database, no Express)
- **Integration tests:** Test full request flow with real database
- Use cases in `application/` layer should have 100% unit test coverage
- Controllers in `presentation/` layer should be thin - just HTTP routing

Example testable use case:
```typescript
// Tests can inject mock repositories, no DB needed
const mockRepo = { findById: jest.fn(), save: jest.fn() };
const useCase = new CreateMaintenanceWorkUseCase(mockRepo);
```

## Deployment (Railway)

GitHub Actions workflow on push to main:

1. Run Flyway migrations against Railway PostgreSQL
2. Build backend Docker image
3. Build frontend Docker image
4. Deploy to Railway (zero-downtime)
5. Instant rollback capability if deployment fails

Environment variables managed through Railway dashboard.

## Key Dependencies

**Backend:**
- `@prisma/client` - Type-safe database client
- `inversify` + `reflect-metadata` - Dependency injection
- `express` - HTTP server
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `zod` - Runtime validation

**Frontend:**
- Vue 3 (Composition API) - Frontend framework
- Vue Router - Client-side routing
- Pinia - State management (property store with CRUD operations)
- Axios - HTTP client with interceptors for JWT
- Tailwind CSS v3 - Utility-first CSS framework with custom design system
- VeeValidate + @vee-validate/zod - Form validation using shared Zod schemas
- vue-toastification - Toast notifications for user feedback

**Shared Libraries:**
- `@upkeep-io/domain` - Entities and errors (Property, User, MaintenanceWork, etc.)
- `@upkeep-io/validators` - Zod validation schemas (createPropertySchema, updatePropertySchema, etc.)
- `@upkeep-io/auth` - JWT utilities and token management

## Cost Budget

$100/month total budget:
- Railway services: ~$35-45/month (Express, Vue, PostgreSQL, Redis)
- Leaves $55-65/month for experimentation and scaling

## Property Management Implementation

The property CRUD system demonstrates DRY principles and Clean Architecture:

**Backend (apps/backend/src/application/property/):**
- `CreatePropertyUseCase` - Validates with shared schema, creates property
- `GetPropertyByIdUseCase` - Retrieves property with ownership verification
- `UpdatePropertyUseCase` - Merges updates with existing data, validates merged result
- `DeletePropertyUseCase` - Deletes property with ownership check
- `ListPropertiesUseCase` - Lists all properties for authenticated user
- All use cases have 100% unit test coverage (13 tests)

**Frontend (apps/frontend/src/):**
- `stores/property.ts` - Pinia store using shared `Property` type
- `views/PropertyFormView.vue` - VeeValidate form using `createPropertySchema` from `@validators/property`
- `views/PropertyListView.vue` - Mobile-first card layout
- `components/PropertyCard.vue` - Reusable property display component
- `components/FormInput.vue` - VeeValidate-integrated input with error handling

**REST API Endpoints:**
- `GET /properties` - List all user properties
- `POST /properties` - Create new property
- `GET /properties/:id` - Get property by ID
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

## Important Notes

- **Backend leads frontend** - API contract is source of truth, frontend adapts to backend
- MaintenanceWork is the central aggregate root - most features revolve around tracking work and costs
- All material expenses, mileage, and labor must be tracked for tax deduction reporting
- RecurringService entity handles scheduled vendor work (e.g., "HVAC service 4 properties twice yearly")
- WorkPerformer flexibility allows tracking owner/family DIY work vs. vendor work
- Keep use cases pure - no Express request/response objects in application layer
- Shared validation schemas ensure frontend and backend validate identically
- Build artifacts (*.js, *.d.ts) in `libs/` are gitignored - only TypeScript source is committed
