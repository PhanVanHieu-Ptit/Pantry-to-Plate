'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';
import type { CookingSession } from '@/lib/db/schema';

import { CookingChat } from './CookingChat';
import { CompletionModal } from './CompletionModal';
import { IngredientsDrawer } from './IngredientsDrawer';
import { StepCard } from './StepCard';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
}

interface CookingPageProps {
  session: CookingSession;
  recipe: GeneratedRecipe;
  locale: string;
  pantryItems: PantryItem[];
}

export function CookingPage({ session, recipe, locale, pantryItems }: CookingPageProps) {
  const t = useTranslations('cooking');
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);

  const steps = recipe.steps ?? [];
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  const completeMutation = trpc.recipes.completeCookingSession.useMutation({
    onSuccess: () => {
      toast.success(t('completedToast'));
      router.push(`/${locale}/recipes`);
    },
    onError: () => {
      toast.error(t('completionError'));
    },
  });

  const progressPct = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleComplete = (
    rating: number,
    notes: string,
    deductItems: { id: string; quantityUsed: number }[],
  ) => {
    completeMutation.mutate({
      sessionId: session.id,
      rating,
      notes,
      deductItems,
    });
  };

  if (!currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy các bước nấu ăn.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="shrink-0 px-4 py-3 border-b flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setExitConfirm(true)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{recipe.name}</p>
          <div className="mt-1.5 w-full bg-muted rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {currentStepIndex + 1}/{totalSteps}
        </span>
      </header>

      {/* Step area */}
      <main className="flex-1 flex items-center justify-center p-4 pb-20">
        <StepCard
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onPrev={handlePrev}
          onNext={handleNext}
          isFirst={currentStepIndex === 0}
          isLast={currentStepIndex === totalSteps - 1}
        />
      </main>

      {/* Ingredients drawer trigger */}
      <IngredientsDrawer
        ingredients={recipe.ingredients}
        checked={checkedIngredients}
        onToggle={toggleIngredient}
      />

      {/* Floating AI chat */}
      <CookingChat recipe={recipe} currentStep={currentStepIndex} />

      {/* Post-cooking completion modal */}
      <CompletionModal
        open={showCompletion}
        recipe={recipe}
        pantryItems={pantryItems}
        onComplete={handleComplete}
        onClose={() => setShowCompletion(false)}
        submitting={completeMutation.isPending}
      />

      {/* Exit confirmation */}
      <AlertDialog open={exitConfirm} onOpenChange={setExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exitTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('exitDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('exitCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/${locale}/recipes`)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t('exitConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
