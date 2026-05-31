'use client';

import { motion, type Variants } from 'framer-motion';
import { useLang } from '../_context/lang';

type Copy<T> = { vi: T; en: T };

const SECTION: Copy<{ eyebrow: string; title: string; sub: string }> = {
  vi: { eyebrow: 'Cách dùng', title: 'Từ tủ lạnh đến bàn ăn',    sub: 'Chỉ 3 bước đơn giản để có bữa ăn ngon mỗi ngày.' },
  en: { eyebrow: 'How it works', title: 'From fridge to fork', sub: 'Three simple steps to a great meal, every day.' },
};

const STEPS = [
  {
    n: '01',
    title: { vi: 'Thêm nguyên liệu',          en: 'Add your pantry'           },
    body:  { vi: 'Chụp ảnh tủ lạnh hoặc thêm thủ công. AI tự nhận diện mọi thứ trong vài giây.', en: 'Snap your fridge or add manually. AI identifies everything in seconds.' },
    emoji: '📸',
  },
  {
    n: '02',
    title: { vi: 'AI phân tích & gợi ý',      en: 'AI analyzes & suggests'    },
    body:  { vi: 'Pantry Pilot xem xét nguyên liệu, ưu tiên những gì sắp hết hạn và gợi ý 3 công thức phù hợp nhất.', en: 'Pantry Pilot reviews your ingredients, prioritizes expiring items, and surfaces 3 best-fit recipes.' },
    emoji: '🤖',
  },
  {
    n: '03',
    title: { vi: 'Nấu với hướng dẫn từng bước', en: 'Cook with step-by-step guidance' },
    body:  { vi: 'Làm theo hướng dẫn chi tiết kèm bộ đếm thời gian tích hợp. Pantry Pilot giữ bạn đúng tiến độ.', en: 'Follow step-by-step instructions with built-in timers. Pantry Pilot keeps you on track.' },
    emoji: '🍳',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};
const stepVariant: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function HowItWorksSection() {
  const { lang } = useLang();
  const s = SECTION[lang];
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="container">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-brand-green font-semibold text-xs uppercase tracking-widest mb-3">
            {s.eyebrow}
          </p>
          <h2 className="font-lora text-4xl font-bold text-foreground">{s.title}</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{s.sub}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Vertical connector line */}
          <div className="absolute left-[21px] top-14 bottom-8 w-0.5 bg-brand-green/15 hidden md:block" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              variants={stepVariant}
              className={`relative flex gap-5 md:gap-7 ${i < STEPS.length - 1 ? 'pb-10 md:pb-12' : ''}`}
            >
              {/* Circle */}
              <div className="flex-shrink-0 relative z-10">
                <div className="w-11 h-11 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-green/30">
                  {step.n}
                </div>
              </div>

              {/* Content */}
              <div className="pt-1.5 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{step.emoji}</span>
                  <h3 className="font-lora font-semibold text-xl text-foreground">{step.title[lang]}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm max-w-lg">{step.body[lang]}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
