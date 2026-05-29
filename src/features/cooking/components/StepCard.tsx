'use client';

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCountdownTimer } from '../hooks/useCountdownTimer';

interface RecipeStep {
  step: number;
  instruction: string;
  duration?: number;
}

interface StepCardProps {
  step: RecipeStep;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function StepCard({ step, stepIndex, totalSteps, onPrev, onNext, isFirst, isLast }: StepCardProps) {
  const t = useTranslations('cooking');
  const durationSecs = (step.duration ?? 0) * 60;
  const { timeLeft, isRunning, start, pause, reset } = useCountdownTimer(durationSecs);

  // Swipe gesture tracking
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0]!.clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0 && !isLast) onNext();
      if (dx < 0 && !isFirst) onPrev();
    }
  };

  const isDone = timeLeft === 0 && durationSecs > 0;

  return (
    <div
      className="flex flex-col items-center w-full max-w-lg mx-auto select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Step counter */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
          {t('step')} {stepIndex + 1} / {totalSteps}
        </Badge>
      </div>

      {/* Instruction */}
      <p className="text-[18px] leading-relaxed text-center font-medium min-h-[6rem] px-2 mb-8">
        {step.instruction}
      </p>

      {/* Timer (only when step has duration) */}
      {step.duration != null && step.duration > 0 && (
        <div
          className={cn(
            'flex flex-col items-center gap-3 rounded-2xl p-5 mb-8 w-full border',
            isDone
              ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
              : 'bg-muted border-border',
          )}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>
              {step.duration} {t('minutes')}
            </span>
          </div>

          <span
            className={cn(
              'text-4xl font-mono font-bold tabular-nums',
              isDone && 'text-green-600 dark:text-green-400',
            )}
          >
            {isDone ? t('timerDone') : formatTime(timeLeft)}
          </span>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                size="sm"
                variant="default"
                onClick={start}
                disabled={isDone}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                {t('startTimer')}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={pause}>
                <Pause className="h-4 w-4 mr-1" />
                {t('pauseTimer')}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('resetTimer')}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 w-full">
        <Button
          variant="outline"
          className="flex-1 h-14 text-base gap-2"
          onClick={onPrev}
          disabled={isFirst}
        >
          <ChevronLeft className="h-5 w-5" />
          {t('previous')}
        </Button>
        <Button
          className="flex-1 h-14 text-base gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onNext}
        >
          {isLast ? t('done') : t('next')}
          {!isLast && <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
