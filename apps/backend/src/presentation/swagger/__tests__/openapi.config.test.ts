/**
 * OpenAPI Configuration Tests
 *
 * Validates that the OpenAPI specification is correctly generated
 * and contains all required endpoints and schemas.
 */

import { swaggerSpec } from '../openapi.config';

describe('OpenAPI Configuration', () => {
  const spec = swaggerSpec as any; // swagger-jsdoc returns object type

  it('should have valid OpenAPI version', () => {
    expect(spec.openapi).toBe('3.0.0');
  });

  it('should have project info', () => {
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBe('Upkeep.io Property Management API');
    expect(spec.info.version).toBe('1.0.0');
  });

  it('should have servers configured', () => {
    expect(spec.servers).toBeDefined();
    expect(spec.servers.length).toBeGreaterThan(0);
    expect(spec.servers[0].url).toBe('http://localhost:3000');
  });

  it('should have security schemes defined', () => {
    expect(spec.components?.securitySchemes).toBeDefined();
    expect(spec.components?.securitySchemes?.bearerAuth).toBeDefined();
  });

  it('should have all auth endpoints', () => {
    expect(spec.paths['/api/auth/signup']).toBeDefined();
    expect(spec.paths['/api/auth/login']).toBeDefined();
  });

  it('should have all property endpoints', () => {
    expect(spec.paths['/api/properties']).toBeDefined();
    expect(spec.paths['/api/properties/{id}']).toBeDefined();
  });

  it('should have all lease endpoints', () => {
    expect(spec.paths['/api/leases']).toBeDefined();
    expect(spec.paths['/api/leases/{id}']).toBeDefined();
    expect(spec.paths['/api/leases/property/{propertyId}']).toBeDefined();
    expect(spec.paths['/api/leases/{id}/lessees']).toBeDefined();
    expect(spec.paths['/api/leases/{id}/lessees/{personId}']).toBeDefined();
    expect(spec.paths['/api/leases/{id}/occupants']).toBeDefined();
    expect(spec.paths['/api/leases/{id}/occupants/{occupantId}']).toBeDefined();
  });

  it('should have schemas for all request/response types', () => {
    const schemas = spec.components?.schemas;
    expect(schemas).toBeDefined();

    // Auth schemas
    expect(schemas?.SignupRequest).toBeDefined();
    expect(schemas?.LoginRequest).toBeDefined();
    expect(schemas?.AuthResponse).toBeDefined();

    // Property schemas
    expect(schemas?.CreatePropertyRequest).toBeDefined();
    expect(schemas?.UpdatePropertyRequest).toBeDefined();
    expect(schemas?.PropertyResponse).toBeDefined();
    expect(schemas?.PropertyListResponse).toBeDefined();

    // Lease schemas
    expect(schemas?.CreateLeaseRequest).toBeDefined();
    expect(schemas?.UpdateLeaseRequest).toBeDefined();
    expect(schemas?.LeaseResponse).toBeDefined();
    expect(schemas?.LeaseListResponse).toBeDefined();

    // Error schemas
    expect(schemas?.ErrorResponse).toBeDefined();
    expect(schemas?.ValidationErrorResponse).toBeDefined();
  });

  it('should have health check endpoint', () => {
    expect(spec.paths['/health']).toBeDefined();
  });

  it('should have proper tags', () => {
    expect(spec.tags).toBeDefined();
    const tagNames = spec.tags?.map((tag: any) => tag.name);
    expect(tagNames).toContain('Health');
    expect(tagNames).toContain('Authentication');
    expect(tagNames).toContain('Properties');
    expect(tagNames).toContain('Leases');
  });

  it('signup endpoint should not require authentication', () => {
    const signupEndpoint = spec.paths['/api/auth/signup'];
    expect(signupEndpoint.post.security).toBeUndefined();
  });

  it('property endpoints should require authentication', () => {
    const propertiesEndpoint = spec.paths['/api/properties'];
    expect(propertiesEndpoint.get.security).toBeDefined();
    expect(propertiesEndpoint.post.security).toBeDefined();
  });
});
