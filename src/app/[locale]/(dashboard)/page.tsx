'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Camera, ChefHat, Clock, Flame, Star } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FridgeScanModal } from '@/features/vision/components/FridgeScanModal';
import { cn } from '@/lib/utils';
import { withErrorBoundary } from '@/components/error-boundary';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/router';

type RouterOutput = inferRouterOutputs<AppRouter>;
type DashboardData = RouterOutput['dashboard']['getDashboardData'];
type SavedRecipe = DashboardData['suggestedRecipes'][number];
type CookingSession = DashboardData['recentSessions'][number];
type PantryItem = DashboardData['expiringItems'][number];

const CARD_GRADIENTS = [
  'from-orange-400 to-rose-500',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
];

const BG_STYLE = {
  backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.04) 1px, transparent 1px)`,
  backgroundSize: '24px 24px',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function useGreeting(name: string): string {
  const t = useTranslations('dashboard');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('goodMorning', { name }));
    else if (hour < 17) setGreeting(t('goodAfternoon', { name }));
    else setGreeting(t('goodEvening', { name }));
  }, [name, t]);

  return greeting;
}

function WasteRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      className="rotate-[-90deg] shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-muted-foreground/20"
      />
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

function StarRating({ value }: { value: number | null }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= (value ?? 0)
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}

function UrgencyBanner({ item, locale }: { item: PantryItem; locale: string }) {
  const t = useTranslations('dashboard');
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">
        🚨 {t('urgencyBanner', { item: item.name })}
      </p>
      <Link href={`/${locale}/recipes`}>
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950 shrink-0"
        >
          {t('cookNow')}
        </Button>
      </Link>
    </div>
  );
}

function StatsRow({ data }: { data: DashboardData }) {
  const t = useTranslations('dashboard');
  const isHotStreak = data.streakDays >= 7;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Pantry count */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('pantryLabel')}</p>
          <p className="text-2xl font-bold leading-none">{data.pantryCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('pantryItems', { count: data.pantryCount })}
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card
        className={cn(
          'rounded-xl transition-all',
          isHotStreak && 'ring-2 ring-amber-400 shadow-md shadow-amber-200/50 dark:shadow-amber-900/50',
        )}
      >
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('streakLabel')}</p>
          <p className="text-2xl font-bold leading-none">
            {isHotStreak ? '🔥 ' : <Flame className="inline h-4 w-4 text-orange-400 mr-0.5" />}
            {data.streakDays}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t('dayStreak')}</p>
        </CardContent>
      </Card>

      {/* Waste score */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('wasteScore')}</p>
          <div className="flex items-center gap-1.5">
            <WasteRing score={data.wasteScore} />
            <span className="text-xl font-bold">{data.wasteScore}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardRecipeCard({
  recipe,
  locale,
  gradientIndex,
}: {
  recipe: SavedRecipe;
  locale: string;
  gradientIndex: number;
}) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const gradient = CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length]!;

  const startSession = trpc.recipes.startCookingSession.useMutation({
    onSuccess: ({ sessionId }) => router.push(`/${locale}/cook/${sessionId}`),
    onError: () => toast.error('Could not start cooking session. Please try again.'),
  });

  const handleCook = () => {
    startSession.mutate({
      recipeData: {
        id: recipe.id,
        name: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        tags: recipe.tags,
        expiryItemsUsed: recipe.expiryItemsUsed,
        missingIngredients: recipe.missingIngredients,
        nutritionEstimate: recipe.nutrition,
      } as Record<string, unknown>,
    });
  };

  return (
    <Card className="rounded-2xl overflow-hidden flex-shrink-0 w-64 sm:w-auto snap-start hover:-translate-y-1 transition-all duration-200 hover:shadow-xl">
      {/* Image placeholder area */}
      <div className={cn('h-40 bg-gradient-to-br relative', gradient)}>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">
            {recipe.title}
          </h3>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <div className="flex flex-wrap gap-1 min-h-[20px]">
          {recipe.difficulty && (
            <Badge
              className={cn(
                'text-xs px-1.5 py-0',
                recipe.difficulty === 'easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : recipe.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
              )}
            >
              {recipe.difficulty}
            </Badge>
          )}
          {(recipe.tags ?? []).slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        {recipe.cookTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{recipe.cookTime}m</span>
          </div>
        )}

        <Button
          size="sm"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleCook}
          disabled={startSession.isPending}
        >
          <ChefHat className="h-3.5 w-3.5 mr-1.5" />
          {t('cookNowBtn')}
        </Button>
      </CardContent>
    </Card>
  );
}

function GenerateCTACard({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  return (
    <Link href={`/${locale}/recipes`} className="block snap-start flex-shrink-0 w-64 sm:w-auto">
      <Card className="rounded-2xl overflow-hidden border-dashed border-2 border-orange-300 hover:border-orange-500 dark:border-orange-800 dark:hover:border-orange-600 transition-colors cursor-pointer h-full min-h-[220px]">
        <CardContent className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
          <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <p className="font-semibold text-sm">{t('generateCTA')}</p>
          <p className="text-xs text-muted-foreground">{t('generateCTASubtext')}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentSessionRow({ session }: { session: CookingSession }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-center justify-between py-3 px-4">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{session.recipeName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(session.cookedAt!).toLocaleDateString()}
          </p>
        </div>
        <StarRating value={session.rating} />
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-64 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function DashboardPage() {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = (params.locale as string) ?? 'vi';
  const [scanOpen, setScanOpen] = useState(false);

  const { data, isLoading } = trpc.dashboard.getDashboardData.useQuery();
  const greeting = useGreeting(data?.userName ?? '');

  if (isLoading) {
    return (
      <div style={BG_STYLE}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8" style={BG_STYLE}>
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
      </div>

      {/* Urgency banner */}
      {data.expiringItems.length > 0 && (
        <UrgencyBanner item={data.expiringItems[0]!} locale={locale} />
      )}

      {/* Stats row */}
      <StatsRow data={data} />

      {/* Cook tonight */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('cookTonightTitle')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible snap-x snap-mandatory">
          {data.needsRecipeGeneration && <GenerateCTACard locale={locale} />}
          {data.suggestedRecipes.map((recipe: SavedRecipe, i: number) => (
            <DashboardRecipeCard
              key={recipe.id}
              recipe={recipe}
              locale={locale}
              gradientIndex={i}
            />
          ))}
          {data.suggestedRecipes.length === 0 && !data.needsRecipeGeneration && (
            <GenerateCTACard locale={locale} />
          )}
        </div>
      </section>

      {/* Recently cooked */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('recentlyCooked')}</h2>
        {data.recentSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noRecentSessions')}</p>
        ) : (
          <div className="space-y-2">
            {data.recentSessions.map((session: CookingSession) => (
              <RecentSessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* FAB — camera scan */}
      <button
        onClick={() => setScanOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
        aria-label={t('scanFridge')}
      >
        <Camera className="h-6 w-6" />
      </button>

      <FridgeScanModal open={scanOpen} onOpenChange={setScanOpen} />
    </div>
  );
}

export default withErrorBoundary(DashboardPage);
