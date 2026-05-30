'use client';

import { useRef } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePantryStore } from '../store';
import { usePantryItems } from '../hooks/use-pantry';
import { PantryItemCard } from './pantry-item-card';
import { PANTRY_CATEGORIES } from '../pantry.schemas';
import type { PantryItemWithComputedFields } from '../types';

const VIRTUALIZE_THRESHOLD = 50;
const GRID_COLS = 4;
const ROW_HEIGHT = 136;

interface PantryListProps {
  onAddItem: () => void;
  onEdit: (item: PantryItemWithComputedFields) => void;
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

function ItemGrid({ items, onEdit }: { items: PantryItemWithComputedFields[]; onEdit: (item: PantryItemWithComputedFields) => void }) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <PantryItemCard key={item.id} item={item} onEdit={onEdit} />
      ))}
    </div>
  );
}

function VirtualizedGrid({
  items,
  onEdit,
}: {
  items: PantryItemWithComputedFields[];
  onEdit: (item: PantryItemWithComputedFields) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const rows: PantryItemWithComputedFields[][] = [];
  for (let i = 0; i < items.length; i += GRID_COLS) {
    rows.push(items.slice(i, i + GRID_COLS));
  }

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
    gap: 12,
  });

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: Math.min(virtualizer.getTotalSize(), window.innerHeight * 0.7) }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index]!;
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {rowItems.map((item) => (
                  <PantryItemCard key={item.id} item={item} onEdit={onEdit} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PantryList({ onAddItem, onEdit }: PantryListProps) {
  const t = useTranslations('pantry');
  const { searchQuery, setSearchQuery } = usePantryStore();
  const { items, isLoading } = usePantryItems();

  const filtered: PantryItemWithComputedFields[] = searchQuery.trim()
    ? items.filter((i: PantryItemWithComputedFields) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const useToday = filtered.filter(
    (i: PantryItemWithComputedFields) => i.expiryStatus === 'expired' || i.expiryStatus === 'critical',
  );
  const rest = filtered.filter(
    (i: PantryItemWithComputedFields) => i.expiryStatus !== 'expired' && i.expiryStatus !== 'critical',
  );

  const byCategory = PANTRY_CATEGORIES.reduce<Record<string, PantryItemWithComputedFields[]>>(
    (acc, cat) => {
      const catItems = rest.filter((i: PantryItemWithComputedFields) => i.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    },
    {},
  );

  const shouldVirtualize = filtered.length > VIRTUALIZE_THRESHOLD;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center gap-4">
          <span className="text-6xl select-none" role="img" aria-label="salad">
            🥗
          </span>
          <h3 className="font-semibold text-lg">{t('emptyTitle')}</h3>
          <p className="text-muted-foreground text-sm max-w-xs">{t('emptyDescription')}</p>
          <Button onClick={onAddItem}>{t('addFirst')}</Button>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        shouldVirtualize ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Showing all {filtered.length} items
            </p>
            <VirtualizedGrid items={filtered} onEdit={onEdit} />
          </div>
        ) : (
          <div className="space-y-8">
            {useToday.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {t('useToday')}
                </h2>
                <ItemGrid items={useToday} onEdit={onEdit} />
              </section>
            )}

            {Object.entries(byCategory).map(([category, catItems]) => (
              <section key={category}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground capitalize">
                  {t(`categories.${category}` as Parameters<typeof t>[0])}
                </h2>
                <ItemGrid items={catItems} onEdit={onEdit} />
              </section>
            ))}
          </div>
        )
      )}
    </div>
  );
}
