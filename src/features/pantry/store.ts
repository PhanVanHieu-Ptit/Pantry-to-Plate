import { create } from 'zustand';
import type { PantryStore, PantryCategory } from './types';

export const usePantryStore = create<PantryStore>((set) => ({
  searchQuery: '',
  selectedCategory: 'all',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory: PantryCategory | 'all') => set({ selectedCategory }),
}));
