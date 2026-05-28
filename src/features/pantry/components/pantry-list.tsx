'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePantryStore } from '../store';
import { usePantryItems } from '../hooks/use-pantry';
import { PantryItemCard } from './pantry-item-card';
import { PANTRY_CATEGORIES } from '../pantry.schemas';
import type { PantryItemWithComputedFields } from '../types';

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

function EmptyState({ onAddItem }: { onAddItem: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center gap-4">
      <span className="text-6xl select-none" role="img" aria-label="salad">
        🥗
      </span>
      <h3 className="font-semibold text-lg">Your pantry is empty</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Start adding ingredients to get personalised recipe suggestions.
      </p>
      <Button onClick={onAddItem}>Add first item</Button>
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

export function PantryList({ onAddItem, onEdit }: PantryListProps) {
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search pantry…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState onAddItem={onAddItem} />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-8">
          {useToday.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Use today
              </h2>
              <ItemGrid items={useToday} onEdit={onEdit} />
            </section>
          )}

          {Object.entries(byCategory).map(([category, catItems]) => (
            <section key={category}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground capitalize">
                {category}
              </h2>
              <ItemGrid items={catItems} onEdit={onEdit} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
