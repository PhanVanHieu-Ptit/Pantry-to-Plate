'use client';

import { Check, ChefHat, Clock, ShoppingCart, Timer, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';

interface RecipeDetailSheetProps {
  recipe: GeneratedRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaved?: boolean;
  onSave?: () => void;
}

function difficultyClass(d: string) {
  if (d === 'easy') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (d === 'medium') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
}

export function RecipeDetailSheet({
  recipe,
  open,
  onOpenChange,
  isSaved = false,
  onSave,
}: RecipeDetailSheetProps) {
  const t = useTranslations('recipes');

  if (!recipe) return null;

  const pantryIngredients = recipe.ingredients.filter((i) => i.isFromPantry);
  const buyIngredients = recipe.ingredients.filter((i) => !i.isFromPantry);

  const nutritionItems = recipe.nutritionEstimate
    ? [
        { label: t('calories'), value: recipe.nutritionEstimate.calories, unit: 'kcal' },
        { label: t('protein'), value: recipe.nutritionEstimate.protein, unit: 'g' },
        { label: t('carbs'), value: recipe.nutritionEstimate.carbs, unit: 'g' },
        { label: t('fat'), value: recipe.nutritionEstimate.fat, unit: 'g' },
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <SheetHeader className="shrink-0 pb-2">
          <div className="flex items-start gap-3">
            <SheetTitle className="text-xl leading-snug flex-1">{recipe.name}</SheetTitle>
            <Badge className={cn('shrink-0 mt-0.5', difficultyClass(recipe.difficulty))}>
              {t(`difficulty.${recipe.difficulty}` as 'difficulty.easy' | 'difficulty.medium' | 'difficulty.hard')}
            </Badge>
          </div>

          {recipe.description && (
            <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t('prepTime', { min: recipe.prepTime })}
            </span>
            <span className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4" />
              {t('cookTime', { min: recipe.cookTime })}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {t('servings', { n: recipe.servings })}
            </span>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Ingredients */}
          <section>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              {t('ingredients')}
            </h3>

            {pantryIngredients.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> {t('inPantry')}
                </p>
                <ul className="space-y-1">
                  {pantryIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-muted-foreground ml-auto">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {buyIngredients.length > 0 && (
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1.5 flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" /> {t('missingIngredients')}
                </p>
                <ul className="space-y-1">
                  {buyIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-muted-foreground ml-auto">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Steps */}
          <section>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              {t('steps')}
            </h3>
            <ol className="space-y-4">
              {recipe.steps.map((step) => (
                <li key={step.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-bold mt-0.5">
                    {step.step}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{step.instruction}</p>
                    {step.duration != null && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {t('minutes', { n: step.duration })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Nutrition */}
          {recipe.nutritionEstimate && (
            <section>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                {t('nutritionPerServing')}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {nutritionItems.map(({ label, value, unit }) => (
                  <div
                    key={label}
                    className="rounded-lg bg-muted p-2 text-center"
                  >
                    <p className="text-base font-bold tabular-nums">{value}</p>
                    <p className="text-xs text-muted-foreground">{unit}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <SheetFooter className="shrink-0 pt-2 gap-2 flex-col sm:flex-row">
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => toast.info(t('cookingModeWip'))}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            {t('startCooking')}
          </Button>
          {!isSaved && onSave && (
            <Button variant="outline" onClick={onSave} className="flex-1">
              {t('saveRecipe')}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
