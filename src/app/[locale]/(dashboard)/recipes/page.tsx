'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc/client';
import type { SavedRecipe } from '@/lib/db/schema';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';

import { RecipeGenerationPanel } from '@/features/recipes/components/RecipeGenerationPanel';
import { RecipeCard } from '@/features/recipes/components/RecipeCard';
import { RecipeDetailSheet } from '@/features/recipes/components/RecipeDetailSheet';

function savedRecipeToGeneratedShape(r: SavedRecipe): GeneratedRecipe {
  return {
    id: r.id,
    name: r.title,
    description: r.description ?? '',
    difficulty: (r.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium',
    prepTime: r.prepTime ?? 15,
    cookTime: r.cookTime ?? 20,
    servings: r.servings ?? 2,
    ingredients: (r.ingredients as { name: string; amount: string; isFromPantry: boolean }[]) ?? [],
    steps: (r.steps as { step: number; instruction: string; duration?: number }[]) ?? [],
    tags: r.tags ?? [],
    nutritionEstimate: (r.nutrition as { calories: number; protein: number; carbs: number; fat: number }) ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    expiryItemsUsed: r.expiryItemsUsed ?? [],
    missingIngredients: r.missingIngredients ?? [],
  };
}

function SavedRecipesGrid() {
  const t = useTranslations('recipes');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'vi';
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.recipes.getSavedRecipes.useQuery({ limit: 12 });
  const deleteMutation = trpc.recipes.deleteRecipe.useMutation({
    onSuccess: () => {
      toast.success(t('deleteSuccess'));
      void utils.recipes.getSavedRecipes.invalidate();
    },
  });

  const startSession = trpc.recipes.startCookingSession.useMutation({
    onSuccess: ({ sessionId }) => router.push(`/${locale}/cook/${sessionId}`),
    onError: () => toast.error('Không thể bắt đầu nấu ăn. Vui lòng thử lại.'),
  });

  const [detailRecipe, setDetailRecipe] = useState<GeneratedRecipe | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl overflow-hidden">
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((r: SavedRecipe) => {
          const recipe = savedRecipeToGeneratedShape(r);
          return (
            <RecipeCard
              key={r.id}
              recipe={recipe}
              isComplete
              isSaved
              onDetails={() => setDetailRecipe(recipe)}
              onCook={() => startSession.mutate({ recipeData: recipe as unknown as Record<string, unknown> })}
            />
          );
        })}
      </div>

      <RecipeDetailSheet
        recipe={detailRecipe}
        open={!!detailRecipe}
        onOpenChange={(open) => !open && setDetailRecipe(null)}
        isSaved
      />
    </>
  );
}

export default function RecipesPage() {
  const t = useTranslations('recipes');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">{t('tabs.generate')}</TabsTrigger>
          <TabsTrigger value="saved">{t('tabs.saved')}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4">
          <RecipeGenerationPanel />
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <SavedRecipesGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
