import { TRPCError } from '@trpc/server';
import { and, eq, lte, lt, sql } from 'drizzle-orm';
import { z } from 'zod';

import { aiUsageCounters, cookingSessions, pantryItems, savedRecipes, userPreferences } from '@/lib/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { generateRecipes } from '@/lib/ai/recipe-generator';

const RATE_LIMIT = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function computeDaysUntilExpiry(expirationDate: Date | null): number | null {
  if (!expirationDate) return null;
  return Math.ceil((expirationDate.getTime() - Date.now()) / MS_PER_DAY);
}

export const recipesRouter = createTRPCRouter({
  // ── Migrated from router.ts ────────────────────────────────────────────────

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.savedRecipes.findMany({
      where: eq(savedRecipes.userId, ctx.session.user.id),
      orderBy: (r, { desc }) => [desc(r.savedAt)],
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
      orderBy: (s, { desc }) => [desc(s.cookedAt)],
    });
  }),

  // ── New procedures ─────────────────────────────────────────────────────────

  generateRecipes: protectedProcedure
    .input(
      z.object({
        useFullPantry: z.boolean().optional().default(true),
        servings: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const today = todayString();

      // Rate limit check
      const [counter] = await ctx.db
        .select()
        .from(aiUsageCounters)
        .where(and(eq(aiUsageCounters.userId, userId), eq(aiUsageCounters.date, today)))
        .limit(1);

      if ((counter?.count ?? 0) >= RATE_LIMIT) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Đã đạt giới hạn tạo công thức hôm nay (10 lần/ngày)',
        });
      }

      // Fetch pantry items
      const pantryRows = await ctx.db
        .select()
        .from(pantryItems)
        .where(eq(pantryItems.userId, userId));

      // Compute expiring items (≤7 days)
      const now = Date.now();
      const expiringItems = pantryRows
        .filter((r) => {
          if (!r.expirationDate) return false;
          const days = Math.ceil((r.expirationDate.getTime() - now) / MS_PER_DAY);
          return days <= 7;
        })
        .map((r) => r.name);

      // Fetch user preferences
      const [prefs] = await ctx.db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      // Call Gemini AI
      const generated = await generateRecipes({
        ingredients: pantryRows.map((r) => ({
          name: r.name,
          quantity: r.quantity,
          unit: r.unit,
          category: r.category,
          daysUntilExpiry: computeDaysUntilExpiry(r.expirationDate),
        })),
        preferences: {
          dietaryRestrictions: prefs?.dietaryRestrictions ?? [],
          dislikedIngredients: prefs?.dislikedIngredients ?? [],
          cuisinePreferences: prefs?.cuisinePreferences ?? [],
          skillLevel: prefs?.skillLevel ?? 1,
        },
        expiringItems,
        servings: input.servings,
      });

      // Persist all 3 recipes
      const inserted = await ctx.db
        .insert(savedRecipes)
        .values(
          generated.recipes.map((r) => ({
            userId,
            title: r.name,
            description: r.description,
            difficulty: r.difficulty,
            prepTime: r.prepTime,
            cookTime: r.cookTime,
            servings: r.servings,
            ingredients: r.ingredients,
            steps: r.steps,
            nutrition: r.nutritionEstimate,
            tags: r.tags,
            source: 'ai_generated' as const,
            expiryItemsUsed: r.expiryItemsUsed,
            missingIngredients: r.missingIngredients,
          })),
        )
        .returning();

      // Increment usage counter (upsert)
      await ctx.db
        .insert(aiUsageCounters)
        .values({ userId, date: today, count: 1 })
        .onConflictDoUpdate({
          target: [aiUsageCounters.userId, aiUsageCounters.date],
          set: { count: sql`${aiUsageCounters.count} + 1` },
        });

      return inserted;
    }),

  getSavedRecipes: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(12),
        cursor: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const fetchLimit = input.limit + 1;

      const rows = await ctx.db
        .select()
        .from(savedRecipes)
        .where(
          input.cursor
            ? and(eq(savedRecipes.userId, userId), lt(savedRecipes.savedAt, new Date(input.cursor)))
            : eq(savedRecipes.userId, userId),
        )
        .orderBy(sql`${savedRecipes.savedAt} DESC`)
        .limit(fetchLimit);

      let nextCursor: string | undefined;
      if (rows.length > input.limit) {
        const next = rows.pop()!;
        nextCursor = next.savedAt.toISOString();
      }

      return { items: rows, nextCursor };
    }),

  saveRecipe: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        prepTime: z.number().int().positive().optional(),
        cookTime: z.number().int().positive().optional(),
        servings: z.number().int().positive().optional(),
        ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
        steps: z.array(z.object({ step: z.number(), instruction: z.string() })),
        nutrition: z
          .object({ calories: z.number(), protein: z.number(), carbs: z.number(), fat: z.number() })
          .optional(),
        tags: z.array(z.string()).optional(),
        expiryItemsUsed: z.array(z.string()).optional(),
        missingIngredients: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [saved] = await ctx.db
        .insert(savedRecipes)
        .values({ ...input, userId: ctx.session.user.id, source: 'ai_generated' as const })
        .returning();
      return saved!;
    }),

  deleteRecipe: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(savedRecipes)
        .where(and(eq(savedRecipes.id, input.id), eq(savedRecipes.userId, ctx.session.user.id)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy công thức' });
      }
      return { success: true };
    }),

  startCookingSession: protectedProcedure
    .input(z.object({ recipeData: z.record(z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      const recipeName = (input.recipeData.name as string) ?? 'Không tên';
      const [session] = await ctx.db
        .insert(cookingSessions)
        .values({
          userId: ctx.session.user.id,
          recipeName,
          recipeData: input.recipeData,
          completed: false,
        })
        .returning();
      return { sessionId: session!.id };
    }),

  getCookingSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .select()
        .from(cookingSessions)
        .where(
          and(
            eq(cookingSessions.id, input.sessionId),
            eq(cookingSessions.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy phiên nấu ăn' });
      }
      return session;
    }),

  completeCookingSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        notes: z.string().optional(),
        deductItems: z.array(
          z.object({ id: z.string().uuid(), quantityUsed: z.number().int().min(1) }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(cookingSessions)
          .set({ completed: true, rating: input.rating, notes: input.notes, cookedAt: new Date() })
          .where(
            and(eq(cookingSessions.id, input.sessionId), eq(cookingSessions.userId, userId)),
          );

        for (const item of input.deductItems) {
          await tx
            .update(pantryItems)
            .set({ quantity: sql`${pantryItems.quantity} - ${item.quantityUsed}` })
            .where(and(eq(pantryItems.id, item.id), eq(pantryItems.userId, userId)));
        }

        if (input.deductItems.length > 0) {
          await tx
            .delete(pantryItems)
            .where(
              and(
                eq(pantryItems.userId, userId),
                lte(pantryItems.quantity, 0),
              ),
            );
        }
      });

      return { success: true };
    }),
});
