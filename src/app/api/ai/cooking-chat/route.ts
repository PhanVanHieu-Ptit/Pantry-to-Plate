import { type NextRequest } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

import { auth } from '@/lib/auth';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    message?: string;
    recipe?: {
      name?: string;
      ingredients?: { name: string; amount: string }[];
      steps?: { step: number; instruction: string }[];
    };
    currentStep?: number;
  };

  const { message, recipe, currentStep = 0 } = body;

  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'Thiếu nội dung tin nhắn' }, { status: 400 });
  }

  const recipeName = recipe?.name ?? 'món ăn này';
  const ingredientList = (recipe?.ingredients ?? [])
    .map((i) => `${i.name} (${i.amount})`)
    .join(', ');
  const currentStepInstruction = recipe?.steps?.[currentStep]?.instruction ?? '';

  const systemPrompt = `Bạn là trợ lý nấu ăn thông minh và thân thiện. Hãy luôn trả lời bằng tiếng Việt, ngắn gọn và thực tế.

Người dùng đang nấu: ${recipeName}
Bước hiện tại (bước ${currentStep + 1}): ${currentStepInstruction}
Nguyên liệu: ${ingredientList || 'không có thông tin'}

Hãy trả lời câu hỏi của họ liên quan đến việc nấu món này. Giữ câu trả lời dưới 3 đoạn văn.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[AI cooking-chat]', err);
    return Response.json(
      { error: 'Không thể xử lý yêu cầu. Vui lòng thử lại.' },
      { status: 500 },
    );
  }
}
