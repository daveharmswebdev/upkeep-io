import { z } from 'zod';

// Schema for updating a tenant (does not include person fields)
export const updateTenantSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID').optional(),
  leaseStartDate: z.string().datetime().optional().or(z.date().optional()),
  leaseEndDate: z.string().datetime().optional().or(z.date().optional()),
  monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
  securityDeposit: z.number().nonnegative('Security deposit cannot be negative').optional(),
  tenantNotes: z.string().max(1000, 'Tenant notes too long').optional(),
}).refine(
  (data) => {
    // If both dates are provided, startDate must be before endDate
    if (data.leaseStartDate && data.leaseEndDate) {
      const start = typeof data.leaseStartDate === 'string'
        ? new Date(data.leaseStartDate)
        : data.leaseStartDate;
      const end = typeof data.leaseEndDate === 'string'
        ? new Date(data.leaseEndDate)
        : data.leaseEndDate;
      return start < end;
    }
    return true;
  },
  {
    message: 'Lease start date must be before end date',
  }
);

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
