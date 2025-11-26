import { z } from 'zod';

export const createNoteSchema = z.object({
  entityType: z.enum(['property', 'lease', 'lease_pet', 'person'], {
    errorMap: () => ({ message: 'Entity type must be one of: property, lease, lease_pet, person' }),
  }),
  entityId: z.string().uuid('Entity ID must be a valid UUID'),
  content: z.string().min(1, 'Note content is required').max(10000, 'Note content too long (max 10000 characters)'),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
