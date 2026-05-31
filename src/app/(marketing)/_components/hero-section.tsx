'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { FoodParticles } from './food-particles';
import { MobileMockup } from './mobile-mockup';
import { useLang } from '../_context/lang';

const COPY = {
  badge:   { vi: 'Trợ lý bếp thông minh AI',     en: 'AI-Powered Kitchen Assistant'   },
  h1a:     { vi: 'Tủ lạnh của bạn',               en: 'Your AI kitchen'                },
  h1b:     { vi: 'luôn có sẵn công thức',         en: 'knows what\'s in your fridge'   },
  sub:     { vi: 'Chụp ảnh tủ lạnh. Nhận công thức cá nhân hóa. Nấu thông minh hơn — lãng phí ít hơn.', en: 'Take a photo. Get personalized recipes. Cook smarter. Waste less.' },
  cta1:    { vi: 'Dùng miễn phí →',               en: 'Start for free →'               },
  cta2:    { vi: 'Xem demo',                       en: 'Watch demo'                     },
  social:  { vi: 'Hơn 2.400 đầu bếp gia đình đang dùng Pantry Pilot', en: 'Join 2,400+ home cooks already using Pantry Pilot' },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function HeroSection() {
  const { lang } = useLang();
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <FoodParticles />

      {/* Radial warm glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(82,183,136,0.12),transparent)]" />

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-24 lg:py-32">
        {/* Left: copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.div variants={item}>
            <Badge className="mb-5 border-brand-green/30 bg-brand-green/10 text-brand-green hover:bg-brand-green/10 text-xs font-semibold px-3 py-1">
              {COPY.badge[lang]}
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-lora text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] text-foreground"
          >
            {COPY.h1a[lang]}
            <br />
            <span className="text-brand-orange">{COPY.h1b[lang]}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed"
          >
            {COPY.sub[lang]}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-brand-green hover:bg-brand-green/90 text-white rounded-xl h-12 px-7 text-base font-semibold shadow-md shadow-brand-green/25"
              asChild
            >
              <Link href={`/${lang}/register`}>{COPY.cta1[lang]}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl h-12 px-7 text-base border-border text-foreground/70 hover:border-foreground/60 hover:text-foreground gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              {COPY.cta2[lang]}
            </Button>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-5 text-sm text-muted-foreground/70"
          >
            {COPY.social[lang]}
          </motion.p>

          {/* Trust badges */}
          <motion.div variants={item} className="mt-6 flex items-center gap-4">
            {['⭐ 4.9/5', '🔒 Miễn phí mãi mãi', '🇻🇳 Tiếng Việt'].map((b, i) => (
              lang === 'vi' ? (
                <span key={i} className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{b}</span>
              ) : null
            ))}
            {lang === 'en' && ['⭐ 4.9/5', '🔒 Free forever', '🌏 Bilingual'].map((b, i) => (
              <span key={i} className="text-xs text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{b}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: phone mockup */}
        <div className="flex justify-center lg:justify-end">
          <MobileMockup />
        </div>
      </div>

      {/* Gradient fade to next section */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
