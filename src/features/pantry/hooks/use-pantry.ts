'use client';

import { trpc } from '@/lib/trpc/client';
import { track } from '@/lib/analytics';
import type { PantryItemWithComputedFields, ExpiryStatus } from '../types';

export function usePantryItems() {
  const { data: items = [], isLoading } = trpc.pantry.getItems.useQuery();
  const expiringItems = items.filter((i: PantryItemWithComputedFields) => i.expiryStatus === 'critical');
  const expiredItems = items.filter((i: PantryItemWithComputedFields) => i.expiryStatus === 'expired');
  return { items, isLoading, expiringItems, expiredItems };
}

export function useAddItem() {
  const utils = trpc.useUtils();

  return trpc.pantry.addItem.useMutation({
    onMutate: async (input) => {
      await utils.pantry.getItems.cancel();
      const previous = utils.pantry.getItems.getData();

      const optimistic: PantryItemWithComputedFields = {
        id: `temp-${Date.now()}`,
        userId: '',
        name: input.name,
        category: input.category,
        quantity: input.quantity,
        unit: input.unit,
        expirationDate: input.expirationDate ?? null,
        expiryAlertDays: 3,
        addedAt: new Date(),
        daysUntilExpiry: null,
        expiryStatus: 'ok' as ExpiryStatus,
      };

      utils.pantry.getItems.setData(undefined, (old: PantryItemWithComputedFields[] | undefined) => (old ? [...old, optimistic] : [optimistic]));
      return { previous };
    },
    onSuccess: (_data, variables) => {
      track('pantry_item_added', { category: variables.category });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        utils.pantry.getItems.setData(undefined, ctx.previous);
      }
    },
    onSettled: () => {
      utils.pantry.getItems.invalidate();
    },
  });
}

export function useDeleteItem() {
  const utils = trpc.useUtils();

  return trpc.pantry.deleteItem.useMutation({
    onMutate: async ({ id }) => {
      await utils.pantry.getItems.cancel();
      const previous = utils.pantry.getItems.getData();
      utils.pantry.getItems.setData(undefined, (old: PantryItemWithComputedFields[] | undefined) => old?.filter((i: PantryItemWithComputedFields) => i.id !== id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        utils.pantry.getItems.setData(undefined, ctx.previous);
      }
    },
    onSettled: () => {
      utils.pantry.getItems.invalidate();
    },
  });
}

export function useUpdateItem() {
  const utils = trpc.useUtils();

  return trpc.pantry.updateItem.useMutation({
    onSettled: () => {
      utils.pantry.getItems.invalidate();
    },
  });
}
