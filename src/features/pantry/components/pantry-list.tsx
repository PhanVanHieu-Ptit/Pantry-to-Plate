'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import type { PantryItem } from '@/lib/db/schema';
import { Card, CardContent } from '@/components/ui/card';

export function PantryList() {
  const t = useTranslations('pantry');
  const { data: items, isLoading } = trpc.pantry.list.useQuery();

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">{t('loading')}</div>;
  }

  if (!items?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">{t('empty')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item: PantryItem) => (
        <Card key={item.id}>
          <CardContent className="pt-6">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.quantity} {item.unit} · {item.category}
            </p>
            {item.expirationDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Expires {new Date(item.expirationDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
