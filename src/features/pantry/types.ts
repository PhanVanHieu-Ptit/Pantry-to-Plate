import type { PantryItem as DrizzlePantryItem } from '@/lib/db/schema';

import type { PANTRY_CATEGORIES } from './pantry.schemas';

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'ok';

export type PantryItem = DrizzlePantryItem;

export type PantryItemWithComputedFields = PantryItem & {
  daysUntilExpiry: number | null;
  expiryStatus: ExpiryStatus;
};

export interface PantryStore {
  searchQuery: string;
  selectedCategory: PantryCategory | 'all';
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: PantryCategory | 'all') => void;
}
