-- Drop tenant and pet tables (deprecated - replaced by Lease entity system)
-- Migration created: 2024-11-18
-- Reason: Tenant and Pet entities were replaced by comprehensive Lease system
--         with Person-based lessees and occupants on November 15, 2024

-- Drop pets table (depends on tenants)
DROP TABLE IF EXISTS "pets" CASCADE;

-- Drop tenants table
DROP TABLE IF EXISTS "tenants" CASCADE;
