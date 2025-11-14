# Flyway Migrations

This directory contains SQL migration scripts for production deployments (Railway).

## Migration Workflow

### Local Development (Prisma)
1. Modify `apps/backend/prisma/schema.prisma`
2. Run `npm run migrate:dev --workspace=apps/backend` to create and apply migration
3. Prisma generates SQL in `apps/backend/prisma/migrations/`

### Production (Flyway)
1. Copy generated SQL from Prisma migration to this folder
2. Name it following Flyway convention: `V{version}__{description}.sql`
   - Example: `V1__init.sql`, `V2__add_vendors.sql`
3. Commit to git
4. GitHub Actions will run Flyway migrations before deploying to Railway

## Naming Convention

- **V{version}__{description}.sql** - Versioned migration (runs once)
- **U{version}__{description}.sql** - Undo migration (optional)
- **R__{description}.sql** - Repeatable migration (runs on checksum change)

## Notes

- Migrations are atomic and transactional
- Failed migrations prevent deployment
- Never modify existing migrations after they've been applied
- Always test migrations locally before pushing to production
