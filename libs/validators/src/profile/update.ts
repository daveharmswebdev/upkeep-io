import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').max(100, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').max(100, 'Last name too long').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long').optional(),
}).strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
