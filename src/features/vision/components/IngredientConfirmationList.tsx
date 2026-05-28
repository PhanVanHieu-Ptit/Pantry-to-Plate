'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PANTRY_CATEGORIES } from '@/features/pantry/pantry.schemas';
import type { DetectedIngredient } from '../types';

const UNITS = ['g', 'kg', 'ml', 'L', 'cái', 'pcs', 'tbsp', 'tsp'] as const;

interface Props {
  items: DetectedIngredient[];
  onItemsChange: (items: DetectedIngredient[]) => void;
  onConfirm: () => void;
  isAdding: boolean;
}

export function IngredientConfirmationList({ items, onItemsChange, onConfirm, isAdding }: Props) {
  const t = useTranslations('vision');
  const tPantry = useTranslations('pantry');

  const includedCount = items.filter((i) => i.included).length;

  function update(id: string, patch: Partial<DetectedIngredient>) {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">
        {t('foundIngredients', { n: items.length })}
      </p>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              'rounded-lg border p-3 transition-opacity',
              item.needsConfirmation
                ? 'border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20'
                : '',
              !item.included ? 'opacity-50' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Top row: checkbox + name + verify badge */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.included}
                onChange={(e) => update(item.id, { included: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded accent-primary"
              />
              <Input
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
                className="h-7 flex-1 text-sm"
              />
              {item.needsConfirmation && (
                <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  {t('pleaseVerify')}
                </span>
              )}
            </div>

            {/* Bottom row: quantity + unit + category */}
            <div className="mt-2 flex items-center gap-2 pl-6">
              <Input
                type="number"
                min="0.01"
                step="any"
                value={item.quantity}
                onChange={(e) =>
                  update(item.id, { quantity: parseFloat(e.target.value) || 1 })
                }
                className="h-7 w-20 text-sm"
              />
              <Select
                value={item.unit}
                onValueChange={(val) => update(item.id, { unit: val })}
              >
                <SelectTrigger className="h-7 w-20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={item.category}
                onValueChange={(val) =>
                  update(item.id, { category: val as DetectedIngredient['category'] })
                }
              >
                <SelectTrigger className="h-7 flex-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PANTRY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {tPantry(`categories.${cat}` as Parameters<typeof tPantry>[0])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onConfirm} disabled={isAdding || includedCount === 0} className="mt-1">
        {isAdding ? '...' : t('addItems', { n: includedCount })}
      </Button>
    </div>
  );
}
