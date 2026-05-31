'use client';

import { motion, type Variants } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLang } from '../_context/lang';

type Copy<T> = { vi: T; en: T };

const SECTION: Copy<{ eyebrow: string; title: string }> = {
  vi: { eyebrow: 'Đánh giá', title: 'Được yêu thích bởi hàng nghìn gia đình' },
  en: { eyebrow: 'Testimonials', title: 'Loved by thousands of home cooks' },
};

const TESTIMONIALS = [
  {
    initials: 'LT',
    name: { vi: 'Lan Trần',      en: 'Sarah L.'       },
    role: { vi: 'Mẹ 3 con',      en: 'Home cook, 3 kids' },
    stars: 5,
    quote: {
      vi: '"Trước đây tôi vứt bỏ rất nhiều rau củ mỗi tuần. Pantry Pilot gần như chấm dứt lãng phí thực phẩm trong nhà tôi. Tính năng quét ảnh thật kỳ diệu."',
      en: '"I used to throw away so much produce every week. Pantry Pilot basically ended food waste in my house. The photo scan is magic."',
    },
    avatarColor: 'bg-brand-green',
  },
  {
    initials: 'MT',
    name: { vi: 'Minh Tuấn',     en: 'Marcus T.'      },
    role: { vi: 'Người tập gym',  en: 'Fitness enthusiast' },
    stars: 5,
    quote: {
      vi: '"Ước tính dinh dưỡng cho mỗi công thức khá chính xác. Tôi thích cách nó gợi ý món giàu protein từ những gì tôi đã có sẵn."',
      en: '"The nutrition estimates on each recipe are surprisingly accurate. I love that it surfaces high-protein options from whatever I already have."',
    },
    avatarColor: 'bg-brand-orange',
  },
  {
    initials: 'AK',
    name: { vi: 'Anh Khoa',      en: 'Aiko K.'        },
    role: { vi: 'Sinh viên',      en: 'Graduate student' },
    stars: 5,
    quote: {
      vi: '"Là sinh viên với ngân sách eo hẹp, việc có công thức tự động xếp hạng theo những gì tôi đã có thật sự thay đổi cuộc sống. Tiết kiệm ~800k/tháng dễ dàng."',
      en: '"As someone on a tight budget, having recipes auto-ranked by what I already own has been a game changer. I save ~$40/month easily."',
    },
    avatarColor: 'bg-amber-500',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const cardVariant: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function TestimonialsSection() {
  const { lang } = useLang();
  const s = SECTION[lang];
  return (
    <section className="py-20 lg:py-28">
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
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name.en} variants={cardVariant} className="h-full">
              <Card className="p-6 border border-border bg-card shadow-sm hover:shadow-md transition-shadow h-full flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-card-foreground/80 text-sm leading-relaxed flex-1 italic">
                  {t.quote[lang]}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${t.avatarColor}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-sm">{t.name[lang]}</p>
                    <p className="text-muted-foreground text-xs">{t.role[lang]}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
