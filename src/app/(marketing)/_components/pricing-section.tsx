'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLang } from '../_context/lang';

type Copy<T> = { vi: T; en: T };

const SECTION: Copy<{ eyebrow: string; title: string; sub: string }> = {
  vi: { eyebrow: 'Bảng giá', title: 'Đơn giản, minh bạch', sub: 'Bắt đầu miễn phí. Nâng cấp khi bạn cần thêm.' },
  en: { eyebrow: 'Pricing',  title: 'Simple, transparent',  sub: 'Start free. Upgrade when you need more.' },
};

type Feature = { text: Copy<string>; included: boolean };

type Tier = {
  name:    Copy<string>;
  price:   string;
  period:  Copy<string>;
  desc:    Copy<string>;
  cta:     Copy<string>;
  plan:    string;
  popular: boolean;
  features: Feature[];
};

const TIERS: Tier[] = [
  {
    name:    { vi: 'Miễn phí',   en: 'Free'    },
    price:   '$0',
    period:  { vi: 'mãi mãi',   en: 'forever' },
    desc:    { vi: 'Để bắt đầu', en: 'To get started' },
    cta:     { vi: 'Bắt đầu',   en: 'Get started' },
    plan:    'free',
    popular: false,
    features: [
      { text: { vi: '5 lượt tạo công thức / tháng',     en: '5 recipe generations / month'  }, included: true  },
      { text: { vi: 'Quét ảnh (3 lần / tháng)',          en: 'Photo scan (3/month)'          }, included: true  },
      { text: { vi: 'Quản lý tủ lạnh cơ bản',            en: 'Basic pantry tracking'         }, included: true  },
      { text: { vi: 'Lưu công thức không giới hạn',      en: 'Unlimited saved recipes'       }, included: false },
      { text: { vi: 'Cảnh báo hết hạn',                  en: 'Expiry alerts'                 }, included: false },
      { text: { vi: 'Chế độ nấu ăn + đồng hồ',           en: 'Cooking mode with timers'      }, included: false },
      { text: { vi: 'Chia sẻ tủ lạnh gia đình',          en: 'Family pantry sharing'         }, included: false },
    ],
  },
  {
    name:    { vi: 'Pro',        en: 'Pro'     },
    price:   '$7.99',
    period:  { vi: '/ tháng',   en: '/month'  },
    desc:    { vi: 'Cho đầu bếp nghiêm túc', en: 'For serious home cooks' },
    cta:     { vi: 'Dùng thử miễn phí',      en: 'Start free trial'       },
    plan:    'pro',
    popular: true,
    features: [
      { text: { vi: 'Tạo công thức không giới hạn',      en: 'Unlimited recipe generations'  }, included: true },
      { text: { vi: 'Quét ảnh không giới hạn',           en: 'Unlimited photo scans'         }, included: true },
      { text: { vi: 'Quản lý tủ lạnh đầy đủ',            en: 'Full pantry tracking'          }, included: true },
      { text: { vi: 'Lưu công thức không giới hạn',      en: 'Unlimited saved recipes'       }, included: true },
      { text: { vi: 'Cảnh báo hết hạn',                  en: 'Expiry alerts'                 }, included: true },
      { text: { vi: 'Chế độ nấu ăn + đồng hồ',           en: 'Cooking mode with timers'      }, included: true },
      { text: { vi: 'Chia sẻ tủ lạnh gia đình',          en: 'Family pantry sharing'         }, included: false },
    ],
  },
  {
    name:    { vi: 'Gia đình',   en: 'Family'  },
    price:   '$12.99',
    period:  { vi: '/ tháng',   en: '/month'  },
    desc:    { vi: 'Tới 6 thành viên', en: 'Up to 6 family members' },
    cta:     { vi: 'Dùng thử miễn phí', en: 'Start free trial'      },
    plan:    'family',
    popular: false,
    features: [
      { text: { vi: 'Tạo công thức không giới hạn',      en: 'Unlimited recipe generations'  }, included: true },
      { text: { vi: 'Quét ảnh không giới hạn',           en: 'Unlimited photo scans'         }, included: true },
      { text: { vi: 'Quản lý tủ lạnh đầy đủ',            en: 'Full pantry tracking'          }, included: true },
      { text: { vi: 'Lưu công thức không giới hạn',      en: 'Unlimited saved recipes'       }, included: true },
      { text: { vi: 'Cảnh báo hết hạn',                  en: 'Expiry alerts'                 }, included: true },
      { text: { vi: 'Chế độ nấu ăn + đồng hồ',           en: 'Cooking mode with timers'      }, included: true },
      { text: { vi: 'Chia sẻ tủ lạnh (6 thành viên)',    en: 'Family pantry sharing (6)'     }, included: true },
    ],
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariant: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function PricingSection() {
  const { lang } = useLang();
  const s = SECTION[lang];
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
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
          <p className="mt-4 text-zinc-500 max-w-md mx-auto">{s.sub}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto"
        >
          {TIERS.map((tier) => (
            <motion.div key={tier.plan} variants={cardVariant}>
              <Card
                className={cn(
                  'relative flex flex-col p-6 border-2 transition-all',
                  tier.popular
                    ? 'border-brand-green shadow-xl shadow-brand-green/10 md:scale-[1.04]'
                    : 'border-zinc-200 shadow-sm',
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-green text-white px-3 py-1 text-xs font-semibold shadow-sm">
                      {lang === 'vi' ? 'Phổ biến nhất' : 'Most popular'}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <p className="font-semibold text-zinc-900 text-base">{tier.name[lang]}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{tier.desc[lang]}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-lora text-4xl font-bold text-zinc-900">{tier.price}</span>
                  <span className="text-zinc-400 text-sm ml-1">{tier.period[lang]}</span>
                </div>

                {/* CTA */}
                <Button
                  className={cn(
                    'w-full rounded-xl mb-6',
                    tier.popular
                      ? 'bg-brand-green hover:bg-brand-green/90 text-white shadow-md shadow-brand-green/25'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white',
                  )}
                  asChild
                >
                  <Link href={`/${lang}/register${tier.plan !== 'free' ? `?plan=${tier.plan}` : ''}`}>
                    {tier.cta[lang]}
                  </Link>
                </Button>

                {/* Feature list */}
                <ul className="space-y-3">
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-start gap-2.5 text-xs',
                        !f.included && 'opacity-40',
                      )}
                    >
                      {f.included ? (
                        <CheckCircle className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-zinc-600 leading-relaxed">{f.text[lang]}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center text-zinc-400 text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {lang === 'vi'
            ? '✓ Không cần thẻ tín dụng  ·  ✓ Hủy bất cứ lúc nào  ·  ✓ Nâng/hạ cấp tự do'
            : '✓ No credit card required  ·  ✓ Cancel anytime  ·  ✓ Upgrade or downgrade freely'}
        </motion.p>
      </div>
    </section>
  );
}
