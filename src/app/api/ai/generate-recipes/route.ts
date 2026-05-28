import { type NextRequest } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiUsageCounters, pantryItems, userPreferences } from '@/lib/db/schema';
import { streamRecipes } from '@/lib/ai/recipe-generator';

const RATE_LIMIT = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const servings = typeof body.servings === 'number' ? body.servings : undefined;
  const selectedItemNames: string[] | undefined = Array.isArray(body.selectedItemNames)
    ? body.selectedItemNames
    : undefined;

  // Rate limit check — return immediately before starting stream
  const today = new Date().toISOString().slice(0, 10);
  const [counter] = await db
    .select()
    .from(aiUsageCounters)
    .where(and(eq(aiUsageCounters.userId, userId), eq(aiUsageCounters.date, today)))
    .limit(1);

  if ((counter?.count ?? 0) >= RATE_LIMIT) {
    return Response.json(
      { error: 'Đã đạt giới hạn tạo công thức hôm nay (10 lần/ngày)', code: 'RATE_LIMIT' },
      { status: 429 },
    );
  }

  // Fetch pantry items and optionally filter to selected names
  const allPantryRows = await db.select().from(pantryItems).where(eq(pantryItems.userId, userId));
  const pantryRows =
    selectedItemNames && selectedItemNames.length > 0
      ? allPantryRows.filter((r) => selectedItemNames.includes(r.name))
      : allPantryRows;

  const now = Date.now();
  const expiringItems = pantryRows
    .filter((r) => {
      if (!r.expirationDate) return false;
      return Math.ceil((r.expirationDate.getTime() - now) / MS_PER_DAY) <= 7;
    })
    .map((r) => r.name);

  // Fetch preferences
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  // Increment usage counter before streaming (prevents double-spend on client abort)
  await db
    .insert(aiUsageCounters)
    .values({ userId, date: today, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsageCounters.userId, aiUsageCounters.date],
      set: { count: sql`${aiUsageCounters.count} + 1` },
    });

  try {
    const result = streamRecipes({
      ingredients: pantryRows.map((r) => ({
        name: r.name,
        quantity: r.quantity,
        unit: r.unit,
        category: r.category,
        daysUntilExpiry: r.expirationDate
          ? Math.ceil((r.expirationDate.getTime() - now) / MS_PER_DAY)
          : null,
      })),
      preferences: {
        dietaryRestrictions: prefs?.dietaryRestrictions ?? [],
        dislikedIngredients: prefs?.dislikedIngredients ?? [],
        cuisinePreferences: prefs?.cuisinePreferences ?? [],
        skillLevel: prefs?.skillLevel ?? 1,
      },
      expiringItems,
      servings,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const partial of result.partialObjectStream) {
            controller.enqueue(encoder.encode(JSON.stringify(partial) + '\n'));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[AI generate-recipes]', err);
    return Response.json({ error: 'Không thể tạo công thức. Vui lòng thử lại.' }, { status: 500 });
  }
}
