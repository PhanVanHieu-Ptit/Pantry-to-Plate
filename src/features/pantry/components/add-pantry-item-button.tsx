'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AddPantryItemButton() {
  const t = useTranslations('pantry');

  return (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      {t('addItem')}
    </Button>
  );
}
