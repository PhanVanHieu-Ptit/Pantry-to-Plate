'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PANTRY_CATEGORIES } from '../pantry.schemas';
import { useAddItem, useUpdateItem } from '../hooks/use-pantry';
import type { PantryItemWithComputedFields } from '../types';

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'tbsp', 'tsp'] as const;

type FormValues = {
  name: string;
  category: (typeof PANTRY_CATEGORIES)[number];
  quantity: number;
  unit: string;
  expirationDate?: string;
};

interface AddItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PantryItemWithComputedFields;
}

export function AddItemSheet({ open, onOpenChange, item }: AddItemSheetProps) {
  const t = useTranslations('pantry');
  const isEdit = !!item;
  const addItem = useAddItem();
  const updateItem = useUpdateItem();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.nameRequired')).max(100),
        category: z.enum(PANTRY_CATEGORIES, { required_error: t('validation.categoryRequired') }),
        quantity: z.coerce
          .number({ invalid_type_error: t('validation.mustBeNumber') })
          .positive(t('validation.mustBePositive')),
        unit: z.string().min(1, t('validation.unitRequired')),
        expirationDate: z.string().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, unit: 'pcs' },
  });

  const categoryValue = watch('category');
  const unitValue = watch('unit');

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name,
          category: item.category as (typeof PANTRY_CATEGORIES)[number],
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate
            ? new Date(item.expirationDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        reset({ quantity: 1, unit: 'pcs', name: '', expirationDate: '' });
      }
    }
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      quantity: values.quantity,
      unit: values.unit,
      expirationDate: values.expirationDate ? new Date(values.expirationDate) : undefined,
    };

    if (isEdit && item) {
      updateItem.mutate(
        { id: item.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t('itemUpdated'));
            onOpenChange(false);
          },
          onError: () => toast.error(t('itemUpdateFailed')),
        },
      );
    } else {
      addItem.mutate(payload, {
        onSuccess: () => {
          toast.success(t('itemAdded'));
          reset({ quantity: 1, unit: 'pcs', name: '', expirationDate: '' });
        },
        onError: () => toast.error(t('itemAddFailed')),
      });
    }
  }

  const isPending = addItem.isPending || updateItem.isPending || isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? t('form.editTitle') : t('form.addTitle')}</SheetTitle>
          <SheetDescription>
            {isEdit ? t('form.editDescription') : t('form.addDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4 flex-1">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t('form.nameLabel')}</Label>
            <Input id="name" placeholder={t('form.namePlaceholder')} {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <Label htmlFor="category">{t('form.categoryLabel')}</Label>
            <Select
              value={categoryValue}
              onValueChange={(val) => setValue('category', val as (typeof PANTRY_CATEGORIES)[number], { shouldValidate: true })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t('form.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PANTRY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`categories.${cat}` as Parameters<typeof t>[0])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">{t('form.quantityLabel')}</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="any"
                placeholder="1"
                {...register('quantity')}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="unit">{t('form.unitLabel')}</Label>
              <Select
                value={unitValue}
                onValueChange={(val) => setValue('unit', val, { shouldValidate: true })}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder={t('form.unitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
            </div>
          </div>

          {/* Expiration Date */}
          <div className="grid gap-1.5">
            <Label htmlFor="expirationDate">{t('form.expirationLabel')}</Label>
            <Input id="expirationDate" type="date" {...register('expirationDate')} />
          </div>

          <SheetFooter className="mt-auto pt-4 gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isEdit ? t('cancel') : t('form.done')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('form.saving') : isEdit ? t('form.saveChanges') : t('form.addAnother')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
