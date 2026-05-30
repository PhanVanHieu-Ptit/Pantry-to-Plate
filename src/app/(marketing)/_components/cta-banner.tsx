'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLang } from '../_context/lang';

const COPY = {
  h2:   { vi: 'Bữa ăn tiếp theo của bạn\nđang giấu trong tủ lạnh.',  en: 'Your next great meal\nis hiding in your fridge.'   },
  sub:  { vi: 'Hàng nghìn gia đình Việt đang giảm lãng phí và nấu ăn ngon hơn — hoàn toàn miễn phí.', en: 'Join thousands of home cooks reducing waste and cooking better — for free.' },
  cta:  { vi: 'Bắt đầu nấu thông minh →',                             en: 'Start cooking smarter →'                                },
  fine: { vi: 'Không cần thẻ tín dụng · Hủy bất cứ lúc nào',         en: 'No credit card required · Cancel anytime'               },
};

export function CtaBanner() {
  const { lang } = useLang();
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-brand-green via-[#1E5C3B] to-[#1B4332]">
      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Warm glow */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/20 blur-3xl rounded-full" />

      <motion.div
        className="container relative z-10 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-lora text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.2] whitespace-pre-line mb-5">
          {COPY.h2[lang]}
        </h2>
        <p className="text-brand-green-light text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          {COPY.sub[lang]}
        </p>
        <Button
          size="lg"
          className="bg-brand-orange hover:bg-brand-orange/90 text-white h-13 px-8 text-base rounded-xl font-semibold shadow-lg shadow-brand-orange/30"
          asChild
        >
          <Link href={`/${lang}/register`}>{COPY.cta[lang]}</Link>
        </Button>
        <p className="mt-4 text-brand-green-light/60 text-sm">{COPY.fine[lang]}</p>
      </motion.div>
    </section>
  );
}
