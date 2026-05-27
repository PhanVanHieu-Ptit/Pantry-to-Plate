import { useTranslations } from 'next-intl';
import { RecipeGrid } from '@/features/recipes/components/recipe-grid';
import { GenerateRecipeButton } from '@/features/recipes/components/generate-recipe-button';

function RecipesPageContent() {
  const t = useTranslations('recipes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <GenerateRecipeButton />
      </div>
      <RecipeGrid />
    </div>
  );
}

export default function RecipesPage() {
  return <RecipesPageContent />;
}
