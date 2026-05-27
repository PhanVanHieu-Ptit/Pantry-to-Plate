import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { users } from '@/lib/db/schema';

export const authRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.session.user.id))
      .limit(1);
    return user ?? null;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          ...(input.image !== undefined && { image: input.image }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id))
        .returning();
      return updated;
    }),
});
