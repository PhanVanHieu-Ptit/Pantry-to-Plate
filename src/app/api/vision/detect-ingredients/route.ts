import { type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { detectIngredientsFromImage } from '@/lib/ai/ingredient-detector';
import type { DetectedIngredient } from '@/features/vision/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('image') as File | null;
  if (!file) {
    return Response.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'invalidFile' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'invalidFile' }, { status: 400 });
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';

    const raw = await detectIngredientsFromImage({ imageData: base64, mimeType });

    const ingredients: DetectedIngredient[] = raw.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      needsConfirmation: item.confidence < 0.7,
      included: true,
    }));

    return Response.json({ ingredients, detectionId: crypto.randomUUID() });
  } catch (err) {
    console.error('[vision detect-ingredients]', err);
    return Response.json(
      {
        error: 'detectionFailed',
        ...(process.env.NODE_ENV === 'development' && {
          detail: err instanceof Error ? err.message : String(err),
        }),
      },
      { status: 500 },
    );
  }
}
