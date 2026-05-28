'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

import { useRecipesStore } from '../store';

export function GenerateRecipeButton() {
  const t = useTranslations('recipes');
  const utils = trpc.useUtils();
  const { generatingRecipe, setGeneratingRecipe } = useRecipesStore();

  const mutation = trpc.recipes.generateRecipes.useMutation({
    onMutate: () => {
      setGeneratingRecipe(true);
    },
    onSuccess: () => {
      toast.success(t('generateSuccess'));
      void utils.recipes.list.invalidate();
      void utils.recipes.getSavedRecipes.invalidate();
    },
    onError: (err) => {
      const msg =
        err.data?.code === 'TOO_MANY_REQUESTS' ? t('rateLimitError') : t('generateError');
      toast.error(msg);
    },
    onSettled: () => {
      setGeneratingRecipe(false);
    },
  });

  const isPending = mutation.isPending || generatingRecipe;

  return (
    <Button
      className="gap-2"
      disabled={isPending}
      onClick={() => mutation.mutate({ useFullPantry: true })}
    >
      <Sparkles className="h-4 w-4" />
      {isPending ? t('generating') : t('generateRecipe')}
    </Button>
  );
}
