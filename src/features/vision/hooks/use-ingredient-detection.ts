'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { trpc } from '@/lib/trpc/client';
import type { DetectedIngredient } from '../types';

type Status = 'idle' | 'detecting' | 'confirming' | 'adding';

export function useIngredientDetection() {
  const t = useTranslations('vision');
  const [status, setStatus] = useState<Status>('idle');
  const [detectedItems, setDetectedItems] = useState<DetectedIngredient[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const utils = trpc.useUtils();

  const bulkAdd = trpc.pantry.bulkAddItems.useMutation({
    onSuccess: (added) => {
      utils.pantry.getItems.invalidate();
      toast.success(t('addSuccess', { n: added.length }));
      reset();
    },
    onError: () => {
      toast.error(t('addFailed'));
      setStatus('confirming');
    },
  });

  const revokePreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reset = useCallback(() => {
    revokePreview();
    setStatus('idle');
    setDetectedItems([]);
    setPreviewUrl(null);
  }, [revokePreview]);

  const detectFromFile = useCallback(
    async (file: File) => {
      revokePreview();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setStatus('detecting');

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/vision/detect-ingredients', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'detectionFailed' }));
          toast.error(body.error === 'invalidFile' ? t('invalidFile') : t('detectionFailed'));
          revokePreview();
          setPreviewUrl(null);
          setStatus('idle');
          return;
        }

        const data = await res.json();
        setDetectedItems(data.ingredients ?? []);
        setStatus('confirming');
      } catch {
        toast.error(t('detectionFailed'));
        revokePreview();
        setPreviewUrl(null);
        setStatus('idle');
      }
    },
    [t, revokePreview],
  );

  const confirmAndAdd = useCallback(() => {
    const included = detectedItems.filter((i) => i.included);
    if (included.length === 0) {
      toast.error(t('noItemsSelected'));
      return;
    }

    setStatus('adding');

    bulkAdd.mutate({
      items: included.map(({ name, quantity, unit, category }) => ({
        name,
        quantity,
        unit,
        category,
      })),
    });
  }, [detectedItems, bulkAdd, t]);

  return {
    detectFromFile,
    isDetecting: status === 'detecting',
    isAdding: status === 'adding',
    detectedItems,
    setDetectedItems,
    confirmAndAdd,
    previewUrl,
    status,
    reset,
  };
}
