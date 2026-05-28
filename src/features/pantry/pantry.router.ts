import { TRPCError } from '@trpc/server';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { pantryItems } from '@/lib/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

import { AddPantryItemInput, UpdatePantryItemInput } from './pantry.schemas';
import type { ExpiryStatus } from './types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function computeExpiry(expirationDate: Date | null): {
  daysUntilExpiry: number | null;
  expiryStatus: ExpiryStatus;
} {
  if (!expirationDate) {
    return { daysUntilExpiry: null, expiryStatus: 'ok' };
  }
  const days = Math.ceil((expirationDate.getTime() - Date.now()) / MS_PER_DAY);
  let expiryStatus: ExpiryStatus;
  if (days < 0) expiryStatus = 'expired';
  else if (days <= 3) expiryStatus = 'critical';
  else if (days <= 7) expiryStatus = 'warning';
  else expiryStatus = 'ok';
  return { daysUntilExpiry: days, expiryStatus };
}

export const pantryRouter = createTRPCRouter({
  getItems: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(pantryItems)
      .where(eq(pantryItems.userId, ctx.session.user.id))
      .orderBy(sql`${pantryItems.expirationDate} ASC NULLS LAST`);

    return rows.map((row) => ({
      ...row,
      ...computeExpiry(row.expirationDate),
    }));
  }),

  addItem: protectedProcedure.input(AddPantryItemInput).mutation(async ({ ctx, input }) => {
    const [item] = await ctx.db
      .insert(pantryItems)
      .values({ ...input, userId: ctx.session.user.id })
      .returning();
    return item!;
  }),

  updateItem: protectedProcedure.input(UpdatePantryItemInput).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const [item] = await ctx.db
      .update(pantryItems)
      .set(data)
      .where(and(eq(pantryItems.id, id), eq(pantryItems.userId, ctx.session.user.id)))
      .returning();

    if (!item) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Pantry item not found' });
    }
    return item;
  }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(pantryItems)
        .where(and(eq(pantryItems.id, input.id), eq(pantryItems.userId, ctx.session.user.id)));
      return { success: true };
    }),

  bulkAddItems: protectedProcedure
    .input(z.object({ items: z.array(AddPantryItemInput).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rows = input.items.map((item) => ({
        ...item,
        userId: ctx.session.user.id,
      }));

      const inserted = await ctx.db
        .insert(pantryItems)
        .values(rows)
        .onConflictDoUpdate({
          target: [pantryItems.userId, pantryItems.name],
          set: { quantity: sql`excluded.quantity` },
        })
        .returning();

      return inserted;
    }),
});
