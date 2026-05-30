import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { cookingSessions, pantryItems, savedRecipes } from '@/lib/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function calculateStreak(daySet: Set<string>, now: Date): number {
  const todayStr = toDateStr(now);
  const yesterdayStr = toDateStr(new Date(now.getTime() - 86400000));

  if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) return 0;

  let streak = 0;
  let cursor = daySet.has(todayStr) ? now : new Date(now.getTime() - 86400000);

  while (true) {
    const str = toDateStr(cursor);
    if (!daySet.has(str)) break;
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  return streak;
}

export const dashboardRouter = createTRPCRouter({
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 86400000);
    const twentyFourHoursAgo = new Date(now.getTime() - 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // Expiring items (between now and now+2 days)
    const expiringItems = await ctx.db
      .select()
      .from(pantryItems)
      .where(
        and(
          eq(pantryItems.userId, userId),
          gte(pantryItems.expirationDate, now),
          lt(pantryItems.expirationDate, twoDaysFromNow),
        ),
      )
      .orderBy(pantryItems.expirationDate);

    // Pantry count
    const [countRow] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(pantryItems)
      .where(eq(pantryItems.userId, userId));
    const pantryCount = countRow?.count ?? 0;

    // Recent completed sessions (last 3)
    const recentSessions = await ctx.db
      .select()
      .from(cookingSessions)
      .where(
        and(
          eq(cookingSessions.userId, userId),
          eq(cookingSessions.completed, true),
        ),
      )
      .orderBy(desc(cookingSessions.cookedAt))
      .limit(3);

    // Suggested recipes — prefer last 24h AI-generated
    const recentAiRecipes = await ctx.db
      .select()
      .from(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, userId),
          eq(savedRecipes.source, 'ai_generated'),
          gte(savedRecipes.savedAt, twentyFourHoursAgo),
        ),
      )
      .orderBy(desc(savedRecipes.savedAt))
      .limit(3);

    const needsRecipeGeneration = recentAiRecipes.length === 0;

    const suggestedRecipes =
      recentAiRecipes.length > 0
        ? recentAiRecipes
        : await ctx.db
            .select()
            .from(savedRecipes)
            .where(
              and(
                eq(savedRecipes.userId, userId),
                eq(savedRecipes.source, 'ai_generated'),
              ),
            )
            .orderBy(desc(savedRecipes.savedAt))
            .limit(3);

    // Streak days — distinct UTC calendar days with completed sessions
    const sessionDayRows = await ctx.db
      .selectDistinct({
        dayStr: sql<string>`to_char(${cookingSessions.cookedAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
      })
      .from(cookingSessions)
      .where(
        and(
          eq(cookingSessions.userId, userId),
          eq(cookingSessions.completed, true),
        ),
      );

    const daySet = new Set(sessionDayRows.map((r) => r.dayStr));
    const streakDays = calculateStreak(daySet, now);

    // Waste score
    const recentCompletedSessions = await ctx.db
      .select({ recipeData: cookingSessions.recipeData })
      .from(cookingSessions)
      .where(
        and(
          eq(cookingSessions.userId, userId),
          eq(cookingSessions.completed, true),
          gte(cookingSessions.cookedAt, thirtyDaysAgo),
        ),
      );

    const usedBeforeExpirySet = new Set<string>();
    for (const s of recentCompletedSessions) {
      const data = s.recipeData as { expiryItemsUsed?: string[] } | null;
      for (const name of data?.expiryItemsUsed ?? []) {
        usedBeforeExpirySet.add(name.toLowerCase());
      }
    }

    const [expiredCountRow] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(pantryItems)
      .where(and(eq(pantryItems.userId, userId), lt(pantryItems.expirationDate, now)));
    const currentlyExpired = expiredCountRow?.count ?? 0;

    const used = usedBeforeExpirySet.size;
    const denom = used + currentlyExpired;
    const wasteScore = denom === 0 ? 100 : Math.round((used / denom) * 100);

    return {
      userName: ctx.session.user.name,
      expiringItems,
      recentSessions,
      pantryCount,
      suggestedRecipes,
      needsRecipeGeneration,
      streakDays,
      wasteScore,
    };
  }),
});
