import { z } from 'zod';

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000, 'Note content too long (max 10000 characters)'),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
