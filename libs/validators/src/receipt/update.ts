import { z } from 'zod';

const receiptCategoryEnum = z.enum([
  'materials',
  'supplies',
  'tools',
  'appliances',
  'fixtures',
  'landscaping',
  'cleaning',
  'other',
]);

// All fields optional for updates (partial updates allowed)
export const updateReceiptSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero').optional(),
  category: receiptCategoryEnum.optional(),
  storeName: z.string().min(1, 'Store name is required').max(100, 'Store name too long').optional(),
  purchaseDate: z.coerce.date().refine(
    (date) => date <= new Date(),
    'Purchase date cannot be in the future'
  ).optional().or(z.literal('').transform(() => undefined)),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  receiptImageUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
