'use client';

import { useState } from 'react';
import { Plus, ScanLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PantryList } from '@/features/pantry/components/pantry-list';
import { AddItemSheet } from '@/features/pantry/components/add-item-sheet';
import { FridgeScanModal } from '@/features/vision/components/FridgeScanModal';
import type { PantryItemWithComputedFields } from '@/features/pantry/types';

export default function PantryPage() {
  const t = useTranslations('pantry');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editItem, setEditItem] = useState<PantryItemWithComputedFields | undefined>(undefined);

  function handleAddItem() {
    setEditItem(undefined);
    setSheetOpen(true);
  }

  function handleEdit(item: PantryItemWithComputedFields) {
    setEditItem(item);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open);
    if (!open) setEditItem(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScanOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" />
            {t('scanFridge')}
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addItem')}
          </Button>
        </div>
      </div>

      <PantryList onAddItem={handleAddItem} onEdit={handleEdit} />

      <AddItemSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        item={editItem}
      />

      <FridgeScanModal open={scanOpen} onOpenChange={setScanOpen} />
    </div>
  );
}
