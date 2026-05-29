'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DeepPartial } from 'ai';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';
import type { PantryItemWithComputedFields } from '@/features/pantry/types';

import { useRecipeGeneration } from '../hooks/use-recipe-generation';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailSheet } from './RecipeDetailSheet';

function isRecipeComplete(recipe: DeepPartial<GeneratedRecipe>): boolean {
  return (
    !!recipe.name &&
    !!recipe.description &&
    Array.isArray(recipe.steps) &&
    recipe.steps.length > 0 &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.length > 0
  );
}

function SkeletonCard() {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-1.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-4" />
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <Skeleton className="h-2 w-6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecipeGenerationPanel() {
  const t = useTranslations('recipes');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'vi';
  const { data: pantryItems = [], isLoading: loadingPantry } = trpc.pantry.getItems.useQuery();
  const utils = trpc.useUtils();
  const [cookingRecipeId, setCookingRecipeId] = useState<string | null>(null);

  const startSession = trpc.recipes.startCookingSession.useMutation({
    onSuccess: ({ sessionId }) => {
      router.push(`/${locale}/cook/${sessionId}`);
    },
    onError: () => {
      toast.error('Không thể bắt đầu nấu ăn. Vui lòng thử lại.');
      setCookingRecipeId(null);
    },
  });

  function handleCook(recipe: GeneratedRecipe) {
    setCookingRecipeId(recipe.id ?? null);
    startSession.mutate({ recipeData: recipe as unknown as Record<string, unknown> });
  }

  const saveRecipeMutation = trpc.recipes.saveRecipe.useMutation({
    onSuccess: () => {
      toast.success(t('saveSuccess'));
      void utils.recipes.getSavedRecipes.invalidate();
      void utils.recipes.list.invalidate();
    },
    onError: () => toast.error(t('saveFailed')),
  });

  const expiringIds = new Set(
    (pantryItems as PantryItemWithComputedFields[])
      .filter((i) => i.expiryStatus === 'critical' || i.expiryStatus === 'warning')
      .map((i) => i.id),
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [useAll, setUseAll] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<GeneratedRecipe | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  // Pre-select expiring items once pantry loads
  useEffect(() => {
    if (!loadingPantry && pantryItems.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(Array.from(expiringIds)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPantry]);

  const { generate, recipes, status, error, reset } = useRecipeGeneration();

  const effectiveSelectedNames = useCallback((): string[] => {
    if (useAll) return (pantryItems as PantryItemWithComputedFields[]).map((i) => i.name);
    return (pantryItems as PantryItemWithComputedFields[])
      .filter((i) => selectedIds.has(i.id))
      .map((i) => i.name);
  }, [useAll, pantryItems, selectedIds]);

  function handleGenerate() {
    const names = effectiveSelectedNames();
    void generate({ selectedItemNames: names.length > 0 ? names : undefined });
  }

  function handleToggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setUseAll(false);
  }

  function handleToggleAll() {
    const next = !useAll;
    setUseAll(next);
    if (next) setSelectedIds(new Set((pantryItems as PantryItemWithComputedFields[]).map((i) => i.id)));
    else setSelectedIds(new Set());
  }

  function handleSave(recipe: DeepPartial<GeneratedRecipe>) {
    if (!isRecipeComplete(recipe)) return;
    const r = recipe as GeneratedRecipe;
    saveRecipeMutation.mutate({
      title: r.name,
      description: r.description,
      difficulty: r.difficulty,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servings: r.servings,
      ingredients: r.ingredients.map(({ name, amount }) => ({ name, amount })),
      steps: r.steps.map(({ step, instruction }) => ({ step, instruction })),
      nutrition: r.nutritionEstimate,
      tags: r.tags,
      expiryItemsUsed: r.expiryItemsUsed,
      missingIngredients: r.missingIngredients,
    });
    if (r.id) setSavedRecipeIds((p) => new Set(p).add(r.id));
  }

  const isGenerating = status === 'loading' || status === 'streaming';

  return (
    <div className="space-y-6">
      {/* Selection card — hidden while generating */}
      {status === 'idle' || status === 'error' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              {t('generateTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPantry ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : pantryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('emptyPantry')}
              </p>
            ) : (
              <>
                {/* Use-all toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={useAll}
                    onChange={handleToggleAll}
                    className="h-4 w-4 rounded accent-orange-500"
                  />
                  <span className="text-sm font-medium group-hover:text-foreground">
                    {t('useAllIngredients')}
                  </span>
                </label>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">{t('orSelectIndividual')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-56 overflow-y-auto pr-1">
                    {(pantryItems as PantryItemWithComputedFields[]).map((item) => {
                      const expiring = expiringIds.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted select-none"
                        >
                          <input
                            type="checkbox"
                            checked={useAll || selectedIds.has(item.id)}
                            onChange={() => handleToggleItem(item.id)}
                            className="h-3.5 w-3.5 rounded accent-orange-500"
                          />
                          <span className="text-sm flex-1 truncate">{item.name}</span>
                          {expiring && (
                            <span className="text-xs text-orange-500 font-medium shrink-0">
                              {t('expiringSoon')}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {status === 'error' && error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleGenerate}
                disabled={pantryItems.length === 0 || isGenerating}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Sparkles className="h-4 w-4" />
                {t('generateRecipe')}
              </Button>
              {status === 'error' && (
                <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('reset')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Status bar while loading/streaming */}
      {(status === 'loading' || status === 'streaming' || status === 'complete') && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {status === 'loading' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('thinking')}
              </>
            )}
            {status === 'streaming' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {t('streamingStatus')}
                </span>
              </>
            )}
            {status === 'complete' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t('completeStatus')}
              </span>
            )}
          </div>
          {status === 'complete' && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              {t('regenerate')}
            </Button>
          )}
        </div>
      )}

      {/* Recipe grid — skeletons while streaming, real cards as they arrive */}
      {(status === 'loading' || status === 'streaming' || status === 'complete') && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {status === 'loading'
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : [0, 1, 2].map((i) => {
                const recipe = recipes[i];
                if (!recipe) return <SkeletonCard key={i} />;
                const complete = isRecipeComplete(recipe);
                return (
                  <RecipeCard
                    key={recipe.id ?? i}
                    recipe={recipe}
                    isComplete={complete}
                    isSaved={!!recipe.id && savedRecipeIds.has(recipe.id)}
                    onSave={() => handleSave(recipe)}
                    onDetails={() => complete && setDetailRecipe(recipe as GeneratedRecipe)}
                    onCook={() => complete && handleCook(recipe as GeneratedRecipe)}
                  />
                );
              })}
        </div>
      )}

      {/* Detail sheet */}
      <RecipeDetailSheet
        recipe={detailRecipe}
        open={!!detailRecipe}
        onOpenChange={(open) => !open && setDetailRecipe(null)}
        isSaved={!!detailRecipe?.id && savedRecipeIds.has(detailRecipe.id)}
        onSave={detailRecipe ? () => handleSave(detailRecipe) : undefined}
      />
    </div>
  );
}
