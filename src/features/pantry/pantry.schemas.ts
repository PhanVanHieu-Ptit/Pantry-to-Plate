import { z } from 'zod';

export const PANTRY_CATEGORIES = [
  'vegetables',
  'fruits',
  'proteins',
  'dairy',
  'grains',
  'condiments',
  'beverages',
  'frozen',
  'other',
] as const;

export const PantryItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(PANTRY_CATEGORIES),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  expirationDate: z.date().optional(),
});

export const AddPantryItemInput = PantryItemSchema;

export const UpdatePantryItemInput = z
  .object({ id: z.string().uuid() })
  .merge(PantryItemSchema.partial());
