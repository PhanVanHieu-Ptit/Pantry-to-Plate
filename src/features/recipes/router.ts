import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { savedRecipes, cookingSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const recipesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.savedRecipes.findMany({
      where: eq(savedRecipes.userId, ctx.session.user.id),
      orderBy: (recipes, { desc }) => [desc(recipes.savedAt)],
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(savedRecipes).where(eq(savedRecipes.id, input.id));
      return { success: true };
    }),

  listSessions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.cookingSessions.findMany({
      where: eq(cookingSessions.userId, ctx.session.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.cookedAt)],
    });
  }),
});
