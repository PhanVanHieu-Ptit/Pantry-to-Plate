import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

import { PANTRY_CATEGORIES } from '@/features/pantry/pantry.schemas';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

const VISION_PROMPT =
  'Phân tích kỹ ảnh tủ lạnh/tủ thực phẩm này. Nhận diện tất cả nguyên liệu thực phẩm, rau củ quả, gia vị và đồ uống có thể nhìn thấy rõ ràng. Với mỗi nguyên liệu, cung cấp: tên (bằng tiếng Việt, viết chuẩn — ví dụ: "ức gà" không phải "thịt", "cà chua" không phải "rau"), số lượng ước tính (dạng số), đơn vị (g/kg/ml/L/cái), danh mục từ danh sách: [vegetables, fruits, proteins, dairy, grains, condiments, beverages, frozen, other], và điểm tin cậy 0-1. Chỉ liệt kê những gì nhìn thấy rõ ràng.';

const DetectedIngredientRawSchema = z.object({
  name: z.string(),
  quantity: z.number().transform((v) => Math.max(v, 0.1)),
  unit: z.string(),
  category: z.enum(PANTRY_CATEGORIES),
  confidence: z.number().catch(0.5).transform((v) => Math.min(1, Math.max(0, v))),
});

const DetectionResultSchema = z.object({
  ingredients: z.array(DetectedIngredientRawSchema),
});

export type DetectedIngredientRaw = z.infer<typeof DetectedIngredientRawSchema>;

export async function detectIngredientsFromImage(params: {
  imageData: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}): Promise<DetectedIngredientRaw[]> {
  const { object } = await generateObject({
    model: google(MODEL),
    schema: DetectionResultSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: params.imageData, mimeType: params.mimeType },
          { type: 'text', text: VISION_PROMPT },
        ],
      },
    ],
    maxTokens: 1024,
    abortSignal: AbortSignal.timeout(30_000),
  });
  return object.ingredients;
}
