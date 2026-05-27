import { create } from 'zustand';
import type { RecipesStore } from './types';

export const useRecipesStore = create<RecipesStore>((set) => ({
  generatingRecipe: false,
  setGeneratingRecipe: (generatingRecipe) => set({ generatingRecipe }),
}));
