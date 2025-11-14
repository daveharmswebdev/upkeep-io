"I have a PROJECT_SETUP_SUMMARY.md as well as a property-management-domain-model.md in the root that documents the full context 
and architectural decisions. Please read it first and use it as the foundation 
for everything you build. Then create the monorepo structure with..."

Create a monorepo with Clean Architecture + inversify + simple structure:

STRUCTURE:
- apps/backend/ (Express + inversify, TypeScript)
- apps/frontend/ (Vue 3)
- libs/domain/ (entities, value objects, errors)
- libs/validators/ (Zod schemas for auth, forms)
- libs/auth/ (JWT generation and verification)

BACKEND (apps/backend/):
- src/core/entities/ (User, Property, MaintenanceWork)
- src/core/errors/ (DomainError, ValidationError, NotFoundError)
- src/domain/repositories/ (IUserRepository interface)
- src/domain/services/ (IPasswordHasher, ITokenGenerator)
- src/application/ (CreateUserUseCase, LoginUserUseCase - testable without Express)
- src/infrastructure/ (PostgresUserRepository, BcryptPasswordHasher, JwtTokenGenerator)
- src/presentation/ (UserController, routes, middleware)
- src/container.ts (inversify DI setup)
- Dockerfile
- tsconfig.json (extends root)
- package.json

FRONTEND (apps/frontend/):
- Vue 3 app with vite
- Login/signup pages
- JWT stored in localStorage
- Axios interceptor for auth header
- Protected routes
- Dockerfile
- package.json

SHARED LIBS:
- libs/domain/src/entities/ (User.ts, etc.)
- libs/validators/src/auth/ (signup.ts, login.ts with Zod)
- libs/auth/src/jwt/ (JwtTokenGenerator, verify logic)
- Path aliases: @domain/*, @validators/*, @auth/*

ROOT CONFIG:
- package.json with workspaces + npm run dev/build/test scripts
- tsconfig.json with path aliases
- docker-compose.yml (Postgres, Redis, backend, frontend)
- GitHub Actions workflow that builds and deploys to Railway
- .env.example files

Make it so npm install, npm run dev, and docker-compose up all work locally.