'use client';

import { motion, type Variants } from 'framer-motion';
import { Camera, ChefHat, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLang } from '../_context/lang';

type Copy<T> = { vi: T; en: T };

const SECTION: Copy<{ eyebrow: string; title: string; sub: string }> = {
  vi: { eyebrow: 'Tính năng', title: 'Mọi thứ bếp bạn cần', sub: 'Từ chụp ảnh đến đặt bàn ăn — Pantry Pilot lo tất cả.' },
  en: { eyebrow: 'Features',  title: 'Everything your kitchen needs', sub: 'From photo scan to plated dinner — Pantry Pilot handles it all.' },
};

const FEATURES = [
  {
    icon: Camera,
    title:   { vi: 'Quét ảnh tức thì',          en: 'Instant Photo Scan'       },
    body:    { vi: 'Chĩa camera vào tủ lạnh. AI nhận diện từng nguyên liệu trong vòng 3 giây.', en: 'Point your camera at any fridge. AI identifies every ingredient in under 3 seconds.' },
    iconBg:  'bg-brand-orange/10',
    iconFg:  'text-brand-orange',
    border:  'hover:border-brand-orange/30',
  },
  {
    icon: ChefHat,
    title:   { vi: 'Công thức thông minh',       en: 'Smart Recipes'            },
    body:    { vi: 'Nhận 3 công thức được xếp hạng theo nguyên liệu phù hợp, thời gian nấu và ngày hết hạn.', en: 'Get 3 recipes ranked by ingredient match, cook time, and what\'s about to expire.' },
    iconBg:  'bg-brand-green/10',
    iconFg:  'text-brand-green',
    border:  'hover:border-brand-green/30',
  },
  {
    icon: Leaf,
    title:   { vi: 'Không lãng phí',             en: 'Zero Waste'               },
    body:    { vi: 'Theo dõi ngày hết hạn tự động. Pantry Pilot nhắc bạn nấu trước khi thức ăn hỏng.', en: 'Track expiry dates automatically. Pantry Pilot nudges you to cook before food goes bad.' },
    iconBg:  'bg-amber-100',
    iconFg:  'text-amber-600',
    border:  'hover:border-amber-300/50',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const cardVariant: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function FeaturesSection() {
  const { lang } = useLang();
  const s = SECTION[lang];
  return (
    <section id="features" className="py-20 lg:py-28">
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
          <h2 className="font-lora text-4xl font-bold text-zinc-900">{s.title}</h2>
          <p className="mt-4 text-zinc-500 max-w-lg mx-auto">{s.sub}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title.en} variants={cardVariant}>
              <Card
                className={`group p-7 border border-zinc-200 bg-white shadow-sm ${f.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.iconBg}`}>
                  <f.icon className={`w-6 h-6 ${f.iconFg}`} />
                </div>
                <h3 className="font-lora font-semibold text-xl mb-3 text-zinc-900">
                  {f.title[lang]}
                </h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{f.body[lang]}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
