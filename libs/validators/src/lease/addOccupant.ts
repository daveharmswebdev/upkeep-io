import { z } from 'zod';

// Occupant schema for adding to a lease
const occupantSchema = z.object({
  personId: z.string().uuid('Invalid person ID').optional(),
  isAdult: z.boolean({ required_error: 'isAdult is required' }),
  moveInDate: z.coerce.date().optional(),
  // Inline person creation fields
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional().or(z.literal('')),
  // Allow empty string or valid email/phone (child occupants may not have these)
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).optional().or(z.literal('')),
}).refine(
  (data) => {
    // Either personId OR inline creation fields must be provided
    const hasPersonId = !!data.personId;
    const hasInlineData = !!(data.firstName && data.lastName);
    return hasPersonId !== hasInlineData; // XOR: one or the other, not both, not neither
  },
  {
    message: 'Either provide personId OR fields (firstName, lastName) for inline creation',
  }
).refine(
  (data) => {
    // If inline creation for adult occupants, email and phone are required
    // Empty strings don't count as having email/phone
    if (!data.personId && data.isAdult && data.firstName && data.lastName) {
      const hasEmail = !!data.email && data.email.length > 0;
      const hasPhone = !!data.phone && data.phone.length > 0;
      return hasEmail && hasPhone;
    }
    return true;
  },
  {
    message: 'Adult occupants require email and phone for inline creation',
  }
).refine(
  (data) => {
    // Child occupants (isAdult = false) only need firstName and lastName
    if (!data.personId && !data.isAdult && data.firstName && data.lastName) {
      return true; // Email and phone are optional for children
    }
    return true;
  },
  {
    message: 'Child occupants only need firstName and lastName',
  }
);

export const addOccupantSchema = occupantSchema;

export type AddOccupantInput = z.infer<typeof addOccupantSchema>;
