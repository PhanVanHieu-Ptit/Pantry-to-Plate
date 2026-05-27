import { useTranslations } from 'next-intl';
import { PantryList } from '@/features/pantry/components/pantry-list';
import { AddPantryItemButton } from '@/features/pantry/components/add-pantry-item-button';

function PantryPageContent() {
  const t = useTranslations('pantry');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <AddPantryItemButton />
      </div>
      <PantryList />
    </div>
  );
}

export default function PantryPage() {
  return <PantryPageContent />;
}
