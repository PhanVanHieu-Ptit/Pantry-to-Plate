'use client';

import { useState } from 'react';
import { Plus, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PantryList } from '@/features/pantry/components/pantry-list';
import { AddItemSheet } from '@/features/pantry/components/add-item-sheet';
import type { PantryItemWithComputedFields } from '@/features/pantry/types';

export default function PantryPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Pantry</h1>
          <p className="text-muted-foreground">
            Track your ingredients and reduce food waste.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Scan fridge coming soon!')}>
            <ScanLine className="mr-2 h-4 w-4" />
            Scan fridge
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>
      </div>

      <PantryList onAddItem={handleAddItem} onEdit={handleEdit} />

      <AddItemSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        item={editItem}
      />
    </div>
  );
}
