import { z } from 'zod';

export const personTypeEnum = z.enum(['OWNER', 'FAMILY_MEMBER', 'VENDOR']);

export const createPersonSchema = z.object({
  personType: personTypeEnum,
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  middleName: z.string().max(50, 'Middle name too long').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
