'use client';

import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
}

interface DeductItem {
  id: string;
  quantityUsed: number;
}

interface CompletionModalProps {
  open: boolean;
  recipe: GeneratedRecipe;
  pantryItems: PantryItem[];
  onComplete: (rating: number, notes: string, deductItems: DeductItem[]) => void;
  onClose: () => void;
  submitting?: boolean;
}

export function CompletionModal({
  open,
  recipe,
  pantryItems,
  onComplete,
  onClose,
  submitting = false,
}: CompletionModalProps) {
  const t = useTranslations('cooking');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Determine which pantry items are used in this recipe
  const pantryIngredientNames = new Set(
    recipe.ingredients.filter((i) => i.isFromPantry).map((i) => i.name.toLowerCase()),
  );
  const matchedPantryItems = pantryItems.filter((p) =>
    pantryIngredientNames.has(p.name.toLowerCase()),
  );

  const [checked, setChecked] = useState<Set<string>>(() => new Set(matchedPantryItems.map((p) => p.id)));

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setRating(5);
      setNotes('');
      setHoverRating(0);
      setChecked(new Set(matchedPantryItems.map((p) => p.id)));

      // Confetti burst
      void confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#fdba74', '#22c55e', '#fde047'],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const deductItems: DeductItem[] = matchedPantryItems
      .filter((p) => checked.has(p.id))
      .map((p) => ({ id: p.id, quantityUsed: 1 }));
    onComplete(rating, notes, deductItems);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !submitting) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('completionTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-center text-muted-foreground">
              {t('rateRecipe')}
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('notes')}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Pantry deduction list */}
          {matchedPantryItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('deductItems')}</p>
              <div className="rounded-lg border p-3 space-y-2.5 max-h-40 overflow-y-auto">
                {matchedPantryItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`deduct-${item.id}`}
                      checked={checked.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <label
                      htmlFor={`deduct-${item.id}`}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {t('qty')}: {item.quantity}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t('submitting') : t('updatePantry')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
