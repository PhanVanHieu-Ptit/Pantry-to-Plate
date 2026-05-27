'use client';

import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecipesStore } from '../store';

export function GenerateRecipeButton() {
  const t = useTranslations('recipes');
  const { generatingRecipe } = useRecipesStore();

  return (
    <Button className="gap-2" disabled={generatingRecipe}>
      <Sparkles className="h-4 w-4" />
      {generatingRecipe ? t('generating') : t('generateRecipe')}
    </Button>
  );
}
