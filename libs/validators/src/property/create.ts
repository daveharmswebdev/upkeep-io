import { z } from 'zod';

export const createPropertySchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200, 'Street address too long'),
  address2: z.string().max(100, 'Address line 2 too long').optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  state: z.string().length(2, 'State must be 2 characters (e.g., CA, NY)'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  nickname: z.string().max(100, 'Nickname too long').optional(),
  purchaseDate: z.coerce.date().optional().or(z.literal('').transform(() => undefined)),
  purchasePrice: z.number().positive('Purchase price must be positive').optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
