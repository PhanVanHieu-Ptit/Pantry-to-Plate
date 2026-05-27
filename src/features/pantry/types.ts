import type { PantryItem } from '@/lib/db/schema';

export type PantryCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'grains'
  | 'condiments'
  | 'beverages'
  | 'frozen'
  | 'other';

export interface PantryStore {
  searchQuery: string;
  selectedCategory: PantryCategory | 'all';
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: PantryCategory | 'all') => void;
}

export type PantryItemWithExpiry = PantryItem & {
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;
};
