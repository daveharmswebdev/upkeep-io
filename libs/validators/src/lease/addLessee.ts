import { z } from 'zod';

// Reuse the lessee schema from create.ts but make it standalone
const lesseeSchema = z.object({
  personId: z.string().uuid('Invalid person ID').optional(),
  signedDate: z.coerce.date().optional(),
  // Inline person creation fields
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Either personId OR inline creation fields must be provided
    const hasPersonId = !!data.personId;
    const hasInlineData = !!(data.firstName && data.lastName && data.email && data.phone);
    return hasPersonId !== hasInlineData; // XOR: one or the other, not both, not neither
  },
  {
    message: 'Either provide personId OR all required fields (firstName, lastName, email, phone) for inline creation',
  }
).refine(
  (data) => {
    // If inline creation, email and phone are required for lessees
    if (!data.personId && data.firstName && data.lastName) {
      return !!data.email && !!data.phone;
    }
    return true;
  },
  {
    message: 'Email and phone are required for lessees',
  }
);

export const addLesseeSchema = z.object({
  voidedReason: z.string().min(1, 'Void reason is required'),
  newLessee: lesseeSchema,
  newLeaseData: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
    securityDeposit: z.number().nonnegative('Security deposit must be non-negative').optional(),
    depositPaidDate: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
}).refine(
  (data) => {
    // If both dates provided, startDate must be before endDate
    if (data.newLeaseData.startDate && data.newLeaseData.endDate) {
      return data.newLeaseData.startDate < data.newLeaseData.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['newLeaseData', 'endDate'],
  }
);

export type AddLesseeInput = z.infer<typeof addLesseeSchema>;
