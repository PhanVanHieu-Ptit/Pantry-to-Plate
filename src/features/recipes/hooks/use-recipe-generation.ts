'use client';

import { useCallback, useRef, useState } from 'react';
import type { DeepPartial } from 'ai';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';
import { track } from '@/lib/analytics';

export type GenerationStatus = 'idle' | 'loading' | 'streaming' | 'complete' | 'error';

export interface UseRecipeGenerationReturn {
  generate: (params: { selectedItemNames?: string[]; servings?: number }) => Promise<void>;
  recipes: DeepPartial<GeneratedRecipe>[];
  status: GenerationStatus;
  error: string | null;
  rateLimitReached: boolean;
  reset: () => void;
}

export function useRecipeGeneration(): UseRecipeGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [recipes, setRecipes] = useState<DeepPartial<GeneratedRecipe>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setRecipes([]);
    setError(null);
    setRateLimitReached(false);
  }, []);

  const generate = useCallback(
    async ({ selectedItemNames, servings }: { selectedItemNames?: string[]; servings?: number }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setRecipes([]);
      setError(null);
      setRateLimitReached(false);

      try {
        const response = await fetch('/api/ai/generate-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedItemNames, servings }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          if (response.status === 429) {
            setRateLimitReached(true);
            setStatus('error');
            return;
          }
          throw new Error(data.error ?? 'Không thể tạo công thức. Vui lòng thử lại.');
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (firstChunk) {
            setStatus('streaming');
            firstChunk = false;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const partial = JSON.parse(line) as { recipes?: DeepPartial<GeneratedRecipe>[] };
              if (Array.isArray(partial.recipes)) {
                setRecipes(partial.recipes);
              }
            } catch {
              // Ignore malformed lines — stream may split JSON across chunks
            }
          }
        }

        if (buffer.trim()) {
          try {
            const partial = JSON.parse(buffer) as { recipes?: DeepPartial<GeneratedRecipe>[] };
            if (Array.isArray(partial.recipes)) {
              setRecipes(partial.recipes);
            }
          } catch {
            // ignore
          }
        }

        setStatus('complete');
        track('recipe_generated');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        setStatus('error');
      }
    },
    [],
  );

  return { generate, recipes, status, error, rateLimitReached, reset };
}
