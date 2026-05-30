'use client';

import { Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RateLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RateLimitModal({ open, onOpenChange }: RateLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
            <Zap className="h-7 w-7 text-orange-500" />
          </div>
          <DialogTitle className="text-center text-lg">Daily limit reached</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ve used all <strong>10 free</strong> AI recipe generations for today.
            Your limit resets at midnight. Upgrade to Pro for unlimited daily recipes.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4 space-y-2">
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Pantry Pilot Pro
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Unlimited AI recipe generations</li>
            <li>✓ Priority AI responses</li>
            <li>✓ Advanced nutrition analysis</li>
            <li>✓ Meal planning calendar</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
            disabled
            title="Coming soon"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
