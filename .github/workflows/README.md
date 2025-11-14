# GitHub Actions Workflows

## Deploy to Railway

This workflow automatically deploys the application to Railway when code is pushed to the `main` branch.

### Workflow Steps

1. **Run Tests** - Execute backend unit tests
2. **Run Database Migrations** - Apply Flyway migrations to Railway PostgreSQL
3. **Deploy Backend** - Deploy Express API to Railway
4. **Deploy Frontend** - Deploy Vue app to Railway

### Required Secrets

Configure these secrets in your GitHub repository settings:

- `RAILWAY_TOKEN` - Railway API token for deployments
- `RAILWAY_DATABASE_URL` - PostgreSQL connection string (format: `jdbc:postgresql://host:port/database`)
- `RAILWAY_DATABASE_USER` - PostgreSQL username
- `RAILWAY_DATABASE_PASSWORD` - PostgreSQL password

### Railway Setup

1. Create a Railway project with the following services:
   - PostgreSQL database
   - Backend service (Node.js)
   - Frontend service (Static site)
   - Redis (optional, for future caching)

2. Set environment variables in Railway dashboard:
   - Backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `CORS_ORIGIN`
   - Frontend: `VITE_API_URL`

3. Generate Railway token:
   ```bash
   railway login
   railway tokens create
   ```

4. Add token to GitHub Secrets

### Local Testing

Test the workflow locally before pushing:

```bash
# Run tests
npm run test:unit --workspace=apps/backend

# Test migration locally
flyway migrate -url=jdbc:postgresql://localhost:5432/upkeep_dev -user=postgres -password=postgres -locations=filesystem:./migrations
```

### Rollback

If deployment fails, Railway automatically maintains the previous version. To manually rollback:

1. Go to Railway dashboard
2. Select the service
3. Click on "Deployments"
4. Rollback to previous successful deployment
