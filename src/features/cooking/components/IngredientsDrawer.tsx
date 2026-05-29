'use client';

import { ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Ingredient {
  name: string;
  amount: string;
  isFromPantry: boolean;
}

interface IngredientsDrawerProps {
  ingredients: Ingredient[];
  checked: Set<string>;
  onToggle: (name: string) => void;
}

export function IngredientsDrawer({ ingredients, checked, onToggle }: IngredientsDrawerProps) {
  const t = useTranslations('cooking');
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed trigger pill */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <Button
          variant="secondary"
          className="rounded-full px-5 py-2 shadow-lg gap-2 text-sm font-medium"
          onClick={() => setOpen(true)}
        >
          <ChevronUp className="h-4 w-4" />
          {t('ingredients')}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle>{t('ingredients')}</SheetTitle>
          </SheetHeader>

          <ul className="space-y-3 pb-6">
            {ingredients.map((ing) => (
              <li key={ing.name} className="flex items-center gap-3">
                <Checkbox
                  id={`ing-${ing.name}`}
                  checked={checked.has(ing.name)}
                  onCheckedChange={() => onToggle(ing.name)}
                />
                <label
                  htmlFor={`ing-${ing.name}`}
                  className={cn(
                    'flex-1 flex items-center gap-2 text-sm cursor-pointer',
                    checked.has(ing.name) && 'line-through text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      ing.isFromPantry ? 'bg-emerald-400' : 'bg-orange-400',
                    )}
                  />
                  <span className="font-medium">{ing.name}</span>
                  <span className="ml-auto text-muted-foreground">{ing.amount}</span>
                </label>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
