import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, streamObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const RecipeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  isFromPantry: z.boolean(),
});

export const RecipeStepSchema = z.object({
  step: z.number().int().positive(),
  instruction: z.string(),
  duration: z.number().optional(),
});

export const RecipeNutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prepTime: z.number().int().positive(),
  cookTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(RecipeStepSchema),
  tags: z.array(z.string()),
  nutritionEstimate: RecipeNutritionSchema,
  expiryItemsUsed: z.array(z.string()),
  missingIngredients: z.array(z.string()),
});

export const GeneratedRecipesSchema = z.object({
  recipes: z.array(RecipeSchema).length(3),
});

export type GeneratedRecipe = z.infer<typeof RecipeSchema>;
export type GeneratedRecipes = z.infer<typeof GeneratedRecipesSchema>;

// ── Input types ───────────────────────────────────────────────────────────────

export interface PantryIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  daysUntilExpiry: number | null;
}

export interface UserPreferencesForAI {
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  cuisinePreferences: string[];
  skillLevel: number;
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Bạn là một đầu bếp sáng tạo và thực tế, chuyên về ẩm thực Việt Nam và châu Á, đồng thời có kiến thức sâu về ẩm thực phương Tây. Nhiệm vụ của bạn là giúp người dùng tận dụng nguyên liệu trong tủ lạnh, ưu tiên những nguyên liệu sắp hết hạn để tránh lãng phí thực phẩm.

NGÔN NGỮ: Luôn trả lời bằng tiếng Việt. Tên món, mô tả và các bước nấu đều phải bằng tiếng Việt. Tên nguyên liệu nên dùng tiếng Việt thông dụng (ví dụ: "fish sauce" → "nước mắm", "lemongrass" → "sả").

PHÂN BỔ MÓN ĂN (bắt buộc):
- Ít nhất 2 trong 3 công thức phải là món Việt hoặc châu Á (Việt Nam, Trung Quốc, Nhật, Hàn, Thái, v.v.)
- Món thứ 3 có thể là fusion hoặc phương Tây nếu phù hợp với nguyên liệu có sẵn

NGUYÊN TẮC QUAN TRỌNG:
1. ƯU TIÊN nguyên liệu sắp hết hạn (≤7 ngày). Ít nhất 1 công thức phải dùng nguyên liệu này làm thành phần chính — không chỉ là gia vị phụ.
2. Phù hợp trình độ nấu ăn của người dùng:
   - Trình độ 1–2 → dễ: xào, canh, gỏi, cơm chiên đơn giản
   - Trình độ 3   → trung bình: kho, hấp có sốt, bún thịt nướng, bánh mì nhân phức tạp
   - Trình độ 4–5 → khó: phở từ xương, thịt quay giòn bì, bánh cuốn, dim sum
3. Tuyệt đối tuân thủ chế độ ăn kiêng và danh sách nguyên liệu không thích của người dùng.
4. Đánh dấu isFromPantry: true nếu nguyên liệu có trong tủ, false nếu cần mua thêm.
5. Liệt kê đầy đủ nguyên liệu cần mua thêm vào missingIngredients[].
6. Thời gian chuẩn bị và nấu phải thực tế — không được ước tính thấp hơn thực tế.
7. Ước tính dinh dưỡng tính trên mỗi khẩu phần, dùng số liệu dinh dưỡng thực phẩm thông thường.
8. ID món ăn: dạng kebab-case không dấu từ tên món, ví dụ "Phở Bò Tái" → "pho-bo-tai", "Canh Chua Cá" → "canh-chua-ca".
9. Tạo ĐÚNG 3 công thức. Đa dạng độ khó: 1 dễ, 1 trung bình, 1 theo trình độ người dùng.
10. Tags hữu ích cho lọc: loại bữa (bua-sang/bua-trua/bua-toi/an-vat), ẩm thực (viet/chinese/korean/japanese/italian/fusion), nguyên liệu chính, phương pháp nấu (xao/kho/hap/nuong/chien).

PHONG CÁCH ẨM THỰC VIỆT NAM: Phở, Bún bò Huế, Cơm tấm, Bún chả, Bún riêu, Canh chua, Canh khổ qua nhồi thịt, Thịt kho tộ, Rau xào tỏi, Gỏi cuốn, Bánh mì, Chả giò, Cháo, Bún thịt nướng, Lẩu. Hương vị đặc trưng: nước mắm, sả, rau thơm (húng quế, rau thơm, ngò gai), ớt, chanh, hồi, quế, hạt nêm.`;

// ── User prompt builder ───────────────────────────────────────────────────────

function buildUserPrompt(params: {
  ingredients: PantryIngredient[];
  preferences: UserPreferencesForAI;
  expiringItems: string[];
  servings?: number;
}): string {
  const { ingredients, preferences, expiringItems, servings = 2 } = params;

  const skillLabels = ['', 'mới bắt đầu', 'cơ bản', 'trung bình', 'khá', 'chuyên nghiệp'];

  const ingredientLines = ingredients
    .map((i) => {
      const expTag = expiringItems.includes(i.name) ? ' ⚠️ SẮP HẾT HẠN' : '';
      return `  - ${i.name}: ${i.quantity} ${i.unit} (${i.category})${expTag}`;
    })
    .join('\n');

  const prefParts: string[] = [];
  if (preferences.dietaryRestrictions.length > 0) {
    prefParts.push(`Chế độ ăn kiêng: ${preferences.dietaryRestrictions.join(', ')}`);
  }
  if (preferences.dislikedIngredients.length > 0) {
    prefParts.push(
      `Nguyên liệu KHÔNG được dùng: ${preferences.dislikedIngredients.join(', ')}`,
    );
  }
  if (preferences.cuisinePreferences.length > 0) {
    prefParts.push(`Ẩm thực yêu thích: ${preferences.cuisinePreferences.join(', ')}`);
  }
  prefParts.push(
    `Trình độ nấu ăn: ${skillLabels[preferences.skillLevel] ?? 'trung bình'} (${preferences.skillLevel}/5)`,
  );

  const expirySection =
    expiringItems.length > 0
      ? `\n⚠️ NGUYÊN LIỆU CẦN DÙNG NGAY (sắp hết hạn trong 7 ngày):\n${expiringItems.map((i) => `  - ${i}`).join('\n')}\n`
      : '';

  return `Tạo 3 công thức nấu ăn cho ${servings} khẩu phần từ các nguyên liệu dưới đây.

NGUYÊN LIỆU TRONG TỦ:
${ingredientLines}
${expirySection}
SỞ THÍCH NGƯỜI DÙNG:
${prefParts.join('\n')}

Yêu cầu:
- Tạo đúng 3 công thức với độ khó đa dạng (1 dễ, 1 trung bình, 1 khó)
- Ít nhất 2 món phải là ẩm thực Việt hoặc châu Á
- Ưu tiên dùng nguyên liệu sắp hết hạn làm thành phần chính (nếu có)
- Đánh dấu isFromPantry: true cho nguyên liệu có trong tủ, false cho nguyên liệu cần mua
- Liệt kê tất cả nguyên liệu cần mua vào missingIngredients[]`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export function streamRecipes(params: {
  ingredients: PantryIngredient[];
  preferences: UserPreferencesForAI;
  expiringItems: string[];
  servings?: number;
}) {
  return streamObject({
    model: google(MODEL),
    schema: GeneratedRecipesSchema,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(params),
    maxTokens: 4096,
    abortSignal: AbortSignal.timeout(55_000),
  });
}

export async function generateRecipes(params: {
  ingredients: PantryIngredient[];
  preferences: UserPreferencesForAI;
  expiringItems: string[];
  servings?: number;
}): Promise<GeneratedRecipes> {
  const { object } = await generateObject({
    model: google(MODEL),
    schema: GeneratedRecipesSchema,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(params),
    maxTokens: 4096,
    abortSignal: AbortSignal.timeout(30_000),
  });

  return object;
}
