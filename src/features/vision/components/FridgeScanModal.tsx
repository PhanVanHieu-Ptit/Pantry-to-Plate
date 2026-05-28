'use client';

import { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIngredientDetection } from '../hooks/use-ingredient-detection';
import { IngredientConfirmationList } from './IngredientConfirmationList';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FridgeScanModal({ open, onOpenChange }: Props) {
  const t = useTranslations('vision');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    detectFromFile,
    isAdding,
    detectedItems,
    setDetectedItems,
    confirmAndAdd,
    previewUrl,
    status,
    reset,
  } = useIngredientDetection();

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) detectFromFile(file);
    e.target.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('modalTitle')}</DialogTitle>
        </DialogHeader>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* View 1: Upload options */}
        {status === 'idle' && (
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Camera className="h-8 w-8" />
              <span className="text-sm font-medium">{t('takePhoto')}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">{t('uploadPhoto')}</span>
            </button>
          </div>
        )}

        {/* View 2: Scanning animation */}
        {status === 'detecting' && previewUrl && (
          <div className="flex flex-col gap-3">
            <style>{`
              @keyframes fridgeScan {
                0%   { top: 0% }
                100% { top: 100% }
              }
              .fridge-scan-line {
                position: absolute;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #22c55e, transparent);
                box-shadow: 0 0 8px #22c55e, 0 0 20px #22c55e;
                animation: fridgeScan 2s linear infinite;
              }
            `}</style>
            <div className="relative overflow-hidden rounded-lg bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="w-full object-cover max-h-64"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="fridge-scan-line" />
            </div>
            <p className="text-center text-sm text-muted-foreground">{t('analyzing')}</p>
          </div>
        )}

        {/* View 3: Confirmation list */}
        {(status === 'confirming' || status === 'adding') && (
          <IngredientConfirmationList
            items={detectedItems}
            onItemsChange={setDetectedItems}
            onConfirm={confirmAndAdd}
            isAdding={isAdding}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
