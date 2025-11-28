import { z } from 'zod';

export const receiptCategoryEnum = z.enum([
  'materials',
  'supplies',
  'tools',
  'appliances',
  'fixtures',
  'landscaping',
  'cleaning',
  'other',
]);

export const createReceiptSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID format'),
  amount: z.number().positive('Amount must be greater than zero'),
  category: receiptCategoryEnum,
  storeName: z.string().min(1, 'Store name is required').max(100, 'Store name too long'),
  purchaseDate: z.coerce.date().refine(
    (date) => date <= new Date(),
    'Purchase date cannot be in the future'
  ),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  receiptImageUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
