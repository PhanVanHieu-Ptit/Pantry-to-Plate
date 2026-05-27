'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import type { SavedRecipe } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecipeGrid() {
  const t = useTranslations('recipes');
  const { data: recipes, isLoading } = trpc.recipes.list.useQuery();

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">{t('loading')}</div>;
  }

  if (!recipes?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">{t('empty')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe: SavedRecipe) => (
        <Card key={recipe.id}>
          <CardHeader>
            <CardTitle className="text-base">{recipe.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Saved {new Date(recipe.savedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
