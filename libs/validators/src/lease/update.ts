import { z } from 'zod';

export const updateLeaseSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
  securityDeposit: z.number().nonnegative('Security deposit must be non-negative').optional(),
  depositPaidDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'MONTH_TO_MONTH', 'ENDED', 'VOIDED']).optional(),
  voidedReason: z.string().optional(),
}).refine(
  (data) => {
    // If both dates provided, startDate must be before endDate
    if (data.startDate && data.endDate) {
      return data.startDate < data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }
);

export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
