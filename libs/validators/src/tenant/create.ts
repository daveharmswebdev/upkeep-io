import { z } from 'zod';

// Schema for creating a tenant (includes inline person creation)
export const createTenantSchema = z.object({
  // Person fields (will be created inline)
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  middleName: z.string().max(50, 'Middle name too long').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  personNotes: z.string().max(1000, 'Person notes too long').optional(),

  // Tenant fields
  propertyId: z.string().uuid('Invalid property ID'),
  leaseStartDate: z.string().datetime().or(z.date()),
  leaseEndDate: z.string().datetime().optional().or(z.date().optional()),
  monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
  securityDeposit: z.number().nonnegative('Security deposit cannot be negative').optional(),
  tenantNotes: z.string().max(1000, 'Tenant notes too long').optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
