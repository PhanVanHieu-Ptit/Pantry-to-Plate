import type { PantryCategory } from '@/features/pantry/types';

export interface DetectedIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: PantryCategory;
  confidence: number;
  needsConfirmation: boolean;
  included: boolean;
}
