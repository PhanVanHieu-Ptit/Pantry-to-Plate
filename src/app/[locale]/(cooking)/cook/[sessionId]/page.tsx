import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookingSessions, pantryItems } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';
import { CookingPage } from '@/features/cooking/components/CookingPage';

interface PageProps {
  params: { locale: string; sessionId: string };
}

export default async function CookSessionPage({ params: { locale, sessionId } }: PageProps) {
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: headers() });
  if (!session) redirect(`/${locale}/login`);

  const [cookSession] = await db
    .select()
    .from(cookingSessions)
    .where(
      and(
        eq(cookingSessions.id, sessionId),
        eq(cookingSessions.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!cookSession) notFound();

  const pantry = await db
    .select({ id: pantryItems.id, name: pantryItems.name, quantity: pantryItems.quantity })
    .from(pantryItems)
    .where(eq(pantryItems.userId, session.user.id));

  const recipe = cookSession.recipeData as unknown as GeneratedRecipe;

  return (
    <CookingPage
      session={cookSession}
      recipe={recipe}
      locale={locale}
      pantryItems={pantry}
    />
  );
}
