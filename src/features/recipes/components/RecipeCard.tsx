'use client';

import {
  ChefHat,
  Clock,
  Flame,
  Heart,
  Info,
  ShoppingCart,
  Users,
} from 'lucide-react';
import type { DeepPartial } from 'ai';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';

interface RecipeCardProps {
  recipe: DeepPartial<GeneratedRecipe>;
  isComplete?: boolean;
  isSaved?: boolean;
  onSave?: () => void;
  onDetails?: () => void;
  onCook?: () => void;
}

const NUTRITION_BARS = [
  { key: 'calories' as const, label: 'Cal', max: 800, color: 'bg-orange-400' },
  { key: 'protein' as const, label: 'P', max: 60, color: 'bg-emerald-500' },
  { key: 'carbs' as const, label: 'C', max: 100, color: 'bg-blue-400' },
  { key: 'fat' as const, label: 'F', max: 60, color: 'bg-yellow-400' },
];

export function RecipeCard({
  recipe,
  isComplete = false,
  isSaved = false,
  onSave,
  onDetails,
  onCook,
}: RecipeCardProps) {
  const t = useTranslations('recipes');
  const hasExpiry = (recipe.expiryItemsUsed?.length ?? 0) > 0;
  const missingCount = recipe.missingIngredients?.length ?? 0;
  const nutrition = recipe.nutritionEstimate;

  function difficultyBadge(difficulty: string | undefined) {
    if (difficulty === 'easy')
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
          {t('difficulty.easy')}
        </Badge>
      );
    if (difficulty === 'medium')
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100">
          {t('difficulty.medium')}
        </Badge>
      );
    if (difficulty === 'hard')
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100">
          {t('difficulty.hard')}
        </Badge>
      );
    return null;
  }

  return (
    <Card
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden border transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-xl',
        hasExpiry && 'border-orange-300 dark:border-orange-700',
        isComplete ? 'opacity-100' : 'opacity-50',
        'transition-opacity duration-500',
      )}
    >
      {/* Expiry banner */}
      {hasExpiry && (
        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950 px-4 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300">
          <Flame className="h-3.5 w-3.5" />
          {t('expiryUsed')}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-base line-clamp-2">
            {recipe.name ?? <span className="text-muted-foreground italic">{t('generating')}</span>}
          </h3>
          {difficultyBadge(recipe.difficulty)}
        </div>

        {/* Time + servings row */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
          {recipe.prepTime != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t('prepTime', { min: recipe.prepTime })}
            </span>
          )}
          {recipe.cookTime != null && (
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              {t('cookTime', { min: recipe.cookTime })}
            </span>
          )}
          {recipe.servings != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {t('servings', { n: recipe.servings })}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        )}

        {/* Tags */}
        {(recipe.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags!.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Missing ingredients warning */}
        {missingCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
            {t('missingCount', { count: missingCount })}
          </div>
        )}

        {/* Nutrition mini-bars */}
        {nutrition && (
          <div className="space-y-1 pt-1">
            {NUTRITION_BARS.map(({ key, label, max, color }) => {
              const val = nutrition[key] ?? 0;
              const pct = Math.min(100, (val / max) * 100);
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-muted-foreground font-medium">{label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className={cn('h-1.5 rounded-full transition-all duration-700', color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
                    {val}
                    {key === 'calories' ? '' : 'g'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2 flex-wrap">
        <Button
          size="sm"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onCook}
          disabled={!isComplete}
        >
          {t('cookNow')}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className={cn(
            'h-8 w-8 shrink-0',
            isSaved && 'text-red-500 border-red-300 hover:text-red-600',
          )}
          onClick={onSave}
          disabled={isSaved || !isComplete}
          title={isSaved ? t('saved') : t('saveRecipe')}
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          onClick={onDetails}
          disabled={!isComplete}
          title={t('details')}
        >
          <Info className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
