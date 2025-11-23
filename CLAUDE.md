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

### TypeScript Configuration

The monorepo uses a layered TypeScript configuration for different module systems. See [docs/typescript-configuration.md](docs/typescript-configuration.md) for complete details.

**Key Points:**
- `tsconfig.base.json` - Shared compiler options for all packages
- `tsconfig.backend.json` - CommonJS for Node.js/Express (extends base)
- `tsconfig.frontend.json` - ES Modules for Vite/Vue (extends base)
- Shared libraries (`libs/*`) extend base config with `module: "ESNext"`
- **Critical:** Shared library package.json files do NOT declare `"type": "module"` to avoid ES Module errors in backend

**Common Issues:**
- **ES Module errors in backend:** Remove `"type": "module"` from `libs/*/package.json`
- **Stale .js files:** Run `find libs -path "*/src/*.js" -delete` to clean up
- **vue-tsc compatibility:** Use vue-tsc 2.x with TypeScript 5.9+
- **Vite import errors:** Ensure vite.config.ts aliases point to `src/` directories

**Module Strategy:**
- Backend: ts-node-dev imports TypeScript source via tsconfig-paths (CommonJS runtime)
- Frontend: Vite bundles TypeScript source via aliases (ES Module output)
- Both apps import the SAME TypeScript source from `libs/*/src/`, compiled differently

### Database: Prisma (Dev) + Flyway (Production)

**Local Development:**
- Prisma schema (`prisma/schema.prisma`) is source of truth
- Run `npm run migrate:dev` to generate and apply migrations locally
- Prisma auto-generates TypeScript client with full type safety

**🚨 CRITICAL: NEVER use `prisma db push`**
- `prisma db push` syncs the database without creating migration files
- This creates schema drift between local and production
- **ALWAYS use `prisma migrate dev`** to create proper migration files
- If you accidentally used `prisma db push`, you must retroactively create the migration using `prisma migrate diff`

**Production (Render):**
- Flyway runs migrations via GitHub Actions (requires manual approval)
- Copy Prisma-generated SQL from `prisma/migrations/` to `apps/backend/migrations/` folder in Flyway format (`V1__init.sql`, `V2__add_vendors.sql`)
- Flyway provides atomic, transactional migrations with rollback capability
- Render auto-deploys backend and frontend when code is pushed to main

**Migration Workflow:**
1. Update `prisma/schema.prisma`
2. Run `prisma migrate dev --name "descriptive_name"`
3. Copy generated SQL to `apps/backend/migrations/VXXX__descriptive_name.sql` for Flyway
4. Commit both prisma schema and migration files
5. Push to GitHub - Tests run automatically
6. Approve migrations in GitHub Actions UI
7. Migrations run on production database
8. Render auto-deploys backend and frontend

## Domain Model

Core entities represent maintenance workflows for rental properties:

- **Property** - Rental properties with addresses
- **MaintenanceWork** - Central entity tying together all work, costs, and travel
- **WorkPerformer** - Tracks who did work (owner, family, or vendor) and time spent
- **Vendor** - Reusable vendors (HVAC companies, plumbers, etc.)
- **Receipt** - Material purchases from stores (tax deduction tracking)
- **TravelActivity** - Mileage tracking for IRS deductions
- **RecurringService** - Scheduled vendor services (HVAC twice yearly, etc.)
- **Lease** - Rental agreements with support for multiple lessees, occupants, and lease history (see `docs/lease-entity.md`)
- **Person** - People associated with properties (owners, lessees, occupants, vendors, family members)

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

**Vue 3 Development Best Practices:**
- **Always use the `vue-development` skill** when planning or implementing Vue 3 components
- The skill enforces TypeScript-first patterns with Composition API
- Use `defineProps<{ }>()` without const assignment unless props are used in script
- Use `defineEmits<{ event: [args] }>()` for type-safe event emissions
- Use `defineModel<type>()` for two-way binding instead of manual `modelValue` props
- Follow user-behavior testing patterns with @vue/test-utils
- The skill helps avoid common pitfalls and ensures modern Vue 3 patterns

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

## Deployment (Render)

**⚠️ IMPORTANT:** See [docs/render-deployment.md](docs/render-deployment.md) for detailed setup instructions, troubleshooting, and common errors. This document contains critical lessons about database URL formats and GitHub secrets configuration.

GitHub Actions workflow on push to main:

1. **Run backend tests** - Must pass before proceeding
2. **Manual migration approval** - You review and approve migrations before they run
3. **Run Flyway migrations** - Applies migrations to Render PostgreSQL (after approval)
4. **Render auto-deploys** - Backend and frontend deploy automatically when Render detects the push

**Key Features:**
- Tests run automatically on every push
- Migrations require manual approval (via GitHub environment protection)
- Render auto-deploys both services when code is pushed to main
- Zero-downtime deployments with instant rollback capability

**Environment Configuration:**
- Backend/frontend environment variables managed through Render dashboard
- GitHub Secrets store database credentials for CI/CD migrations
- Backend uses internal database URL for optimal performance

**GitHub Environment Protection Setup** (one-time setup):

1. Go to your GitHub repository → Settings → Environments
2. Click "New environment" and name it `production`
3. Under "Environment protection rules":
   - Enable "Required reviewers"
   - Add yourself (and any other approvers)
4. Under "Environment secrets", add:
   - `RENDER_DATABASE_URL` = **CRITICAL:** Must use JDBC format: `jdbc:postgresql://host:5432/database` (NOT the PostgreSQL URL from Render dashboard)
   - `RENDER_DATABASE_USER` = Database username
   - `RENDER_DATABASE_PASSWORD` = Database password
   - See [docs/render-deployment.md](docs/render-deployment.md) for exact format and troubleshooting
5. Save the environment

Now when migrations run, GitHub will pause and wait for your approval before applying them to production.

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
- Render services: ~$35-45/month (Backend, Frontend, PostgreSQL)
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

## Frontend Utilities (Use What's in the Pantry!)

**CRITICAL: Before writing new logic, ALWAYS check existing utilities first.** The frontend has a comprehensive utility layer located in `apps/frontend/src/utils/` with 100% test coverage. Reuse these pure functions instead of duplicating logic.

### Available Utility Modules

**1. `formatters.ts`** - Display formatting (45+ lines of reusable code)
```typescript
import { formatPrice, formatDate, formatDateTime } from '@/utils/formatters';

formatPrice(1234.56)                    // "1,234.56"
formatDate(new Date(), 'short')         // "Jan 15, 2024"
formatDate(new Date(), 'long')          // "January 15, 2024"
formatDateTime(new Date())              // "Jan 15, 2024, 02:30 PM"
```
**When to use:** Displaying currency, dates, or timestamps in components/views

**2. `dateHelpers.ts`** - Form date conversion
```typescript
import { convertFormDates, convertNestedDates } from '@/utils/dateHelpers';

// Single object with multiple date fields
const data = convertFormDates(formValues, ['startDate', 'endDate', 'purchaseDate']);

// Array of objects with date fields (lessees, occupants, etc.)
const data = {
  ...convertFormDates(formValues, ['startDate']),
  lessees: convertNestedDates(formValues.lessees, ['signedDate'])
};
```
**When to use:** Converting form date strings to Date objects before API calls

**3. `errorHandlers.ts`** - Centralized error extraction
```typescript
import { extractErrorMessage, isAuthError, isValidationError } from '@/utils/errorHandlers';

catch (err: any) {
  error.value = extractErrorMessage(err, 'Operation failed. Please try again.');

  if (isAuthError(err)) {
    // Handle 401/403
  }
  if (isValidationError(err)) {
    // Handle 400/422
  }
}
```
**When to use:** All API error handling in views and stores

**4. `storage.ts`** - LocalStorage abstraction
```typescript
import { authStorage, type User } from '@/utils/storage';

authStorage.getToken()           // Get JWT token
authStorage.setToken(token)      // Save JWT token
authStorage.getUser()            // Get user object
authStorage.setUser(user)        // Save user object
authStorage.clear()              // Clear all auth data
```
**When to use:** Any authentication-related storage operations (instead of direct localStorage calls)

### Development Workflow: Check the Pantry First

**Before implementing ANY new feature:**

1. **Check `apps/frontend/src/utils/`** - Does a utility already exist for this?
2. **Check shared libraries** - `@domain/*`, `@validators/*`, `@auth/*`
3. **Search for similar patterns** - How did existing features solve this?
4. **Only create new code** if nothing reusable exists

**Examples:**

❌ **DON'T:** Write a new function to format prices
```typescript
const formatCurrency = (val: number) => `$${val.toFixed(2)}`;  // DUPLICATION!
```

✅ **DO:** Use existing utility
```typescript
import { formatPrice } from '@/utils/formatters';
```

❌ **DON'T:** Write inline error extraction
```typescript
catch (err: any) {
  error.value = err.response?.data?.error || 'Failed';  // PATTERN ALREADY EXISTS!
}
```

✅ **DO:** Use existing utility
```typescript
import { extractErrorMessage } from '@/utils/errorHandlers';
catch (err: any) {
  error.value = extractErrorMessage(err, 'Failed');
}
```

**Metaphorically speaking: Use what's in the pantry before buying more groceries.**

If you find yourself writing similar logic that exists elsewhere:
1. **STOP** - Don't duplicate
2. **REFACTOR** - Extract to utility if reusable
3. **TEST** - Write unit tests for the utility
4. **MIGRATE** - Update existing code to use it

## Important Notes

- **ALWAYS check existing utilities before writing new code** - See "Frontend Utilities" section above. Use what's in the pantry before buying groceries!
- **NEVER use `prisma db push` for schema changes** - ALWAYS use `prisma migrate dev` to create proper migration files. Using `db push` causes schema drift and production errors.
- **Backend leads frontend** - API contract is source of truth, frontend adapts to backend
- MaintenanceWork is the central aggregate root - most features revolve around tracking work and costs
- All material expenses, mileage, and labor must be tracked for tax deduction reporting
- RecurringService entity handles scheduled vendor work (e.g., "HVAC service 4 properties twice yearly")
- WorkPerformer flexibility allows tracking owner/family DIY work vs. vendor work
- Keep use cases pure - no Express request/response objects in application layer
- Shared validation schemas ensure frontend and backend validate identically
- Build artifacts (*.js, *.d.ts) in `libs/` are gitignored - only TypeScript source is committed
- **Never duplicate logic** - Extract reusable code to utilities with tests, then migrate existing duplicates
