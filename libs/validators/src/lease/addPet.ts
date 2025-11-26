import { z } from 'zod';

// Pet schema for adding to a lease
export const addPetSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(100, 'Pet name must be 100 characters or less'),
  species: z.enum(['cat', 'dog'], { required_error: 'Species must be either cat or dog' }),
  notes: z.string().optional().or(z.literal('')),
});

export type AddPetInput = z.infer<typeof addPetSchema>;
