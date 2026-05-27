import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { pantryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const pantryItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  expirationDate: z.date().optional(),
  expiryAlertDays: z.number().int().min(1).max(30).default(3),
});

export const pantryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.pantryItems.findMany({
      where: eq(pantryItems.userId, ctx.session.user.id),
      orderBy: (items, { desc }) => [desc(items.addedAt)],
    });
  }),

  create: protectedProcedure.input(pantryItemSchema).mutation(async ({ ctx, input }) => {
    const [item] = await ctx.db
      .insert(pantryItems)
      .values({ ...input, userId: ctx.session.user.id })
      .returning();
    return item!;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid() }).merge(pantryItemSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [item] = await ctx.db
        .update(pantryItems)
        .set(data)
        .where(eq(pantryItems.id, id))
        .returning();
      return item!;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(pantryItems).where(eq(pantryItems.id, input.id));
      return { success: true };
    }),
});
