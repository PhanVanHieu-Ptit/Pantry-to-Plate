'use client';

import { memo, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteItem } from '../hooks/use-pantry';
import type { PantryCategory, PantryItemWithComputedFields } from '../types';

const CATEGORY_COLORS: Record<PantryCategory, string> = {
  vegetables: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  fruits: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  proteins: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  dairy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  grains: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  condiments: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  beverages: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  frozen: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const EXPIRY_COLORS = {
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ok: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

interface PantryItemCardProps {
  item: PantryItemWithComputedFields;
  onEdit: (item: PantryItemWithComputedFields) => void;
}

export const PantryItemCard = memo(function PantryItemCard({ item, onEdit }: PantryItemCardProps) {
  const t = useTranslations('pantry');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteItem = useDeleteItem();

  function expiryLabel(): string {
    if (!item.expirationDate) return '';
    if (item.expiryStatus === 'expired') return t('expiry.expired');
    if (item.daysUntilExpiry === 0) return t('expiry.today');
    if (item.daysUntilExpiry === 1) return t('expiry.tomorrow');
    if (item.daysUntilExpiry !== null && item.daysUntilExpiry <= 7)
      return t('expiry.inDays', { n: item.daysUntilExpiry });
    return t('expiry.on', { date: new Date(item.expirationDate).toLocaleDateString() });
  }

  function handleDelete() {
    deleteItem.mutate(
      { id: item.id },
      {
        onSuccess: () => toast.success(t('itemRemoved', { name: item.name })),
        onError: () => toast.error(t('itemDeleteFailed')),
      },
    );
    setConfirmOpen(false);
  }

  const expiry = expiryLabel();

  return (
    <>
      <Card className="group relative transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-tight line-clamp-2">{item.name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {item.quantity} {item.unit}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={`border-0 text-xs ${CATEGORY_COLORS[item.category as PantryCategory]}`}
            >
              {t(`categories.${item.category}` as Parameters<typeof t>[0])}
            </Badge>

            {expiry && (
              <Badge
                variant="outline"
                className={`border-0 text-xs ${EXPIRY_COLORS[item.expiryStatus]}`}
              >
                {expiry}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('deleteDescription', { name: item.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
