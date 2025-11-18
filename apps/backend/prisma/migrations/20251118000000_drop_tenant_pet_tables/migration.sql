-- Drop tenant and pet tables (deprecated - replaced by Lease entity system)

-- Drop pets table (depends on tenants)
DROP TABLE IF EXISTS "pets" CASCADE;

-- Drop tenants table
DROP TABLE IF EXISTS "tenants" CASCADE;
