'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { GeneratedRecipe } from '@/lib/ai/recipe-generator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface CookingChatProps {
  recipe: GeneratedRecipe;
  currentStep: number;
}

export function CookingChat({ recipe, currentStep }: CookingChatProps) {
  const t = useTranslations('cooking');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    `Làm thế nào để biết ${recipe.name} đã chín chưa?`,
    ...(recipe.missingIngredients.length > 0
      ? [`Thay thế ${recipe.missingIngredients[0]} bằng gì được?`]
      : []),
    'Mẹo để món này ngon hơn?',
  ];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '', streaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/ai/cooking-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, recipe, currentStep }),
      });

      if (!res.ok || !res.body) throw new Error('Lỗi kết nối');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: true };
          return next;
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: false };
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
          streaming: false,
        };
        return next;
      });
    } finally {
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
          aria-label={t('chat')}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden"
          style={{ height: '420px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {t('chat')}
              </span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Gợi ý câu hỏi:</p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs rounded-lg border px-3 py-2 hover:bg-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'text-sm rounded-xl px-3 py-2 max-w-[90%]',
                  msg.role === 'user'
                    ? 'ml-auto bg-orange-500 text-white'
                    : 'bg-muted text-foreground',
                )}
              >
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-1 h-3 bg-current ml-0.5 animate-pulse" />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              disabled={loading}
            />
            <Button
              size="icon"
              className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => void send(input)}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
