import { z } from 'zod';

export const createPropertySchema = z.object({
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  state: z.string().length(2, 'State must be 2 characters (e.g., CA, NY)'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  nickname: z.string().max(100, 'Nickname too long').optional(),
  purchaseDate: z.string().datetime().optional().or(z.date().optional()),
  purchasePrice: z.number().positive('Purchase price must be positive').optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
