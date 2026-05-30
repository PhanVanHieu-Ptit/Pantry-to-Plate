'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useLang } from '../_context/lang';

export function MarketingFooter() {
  const { lang } = useLang();
  const year = new Date().getFullYear();

  const links = lang === 'vi'
    ? [
        { label: 'Quyền riêng tư', href: '#' },
        { label: 'Điều khoản',     href: '#' },
        { label: 'Liên hệ',        href: '#' },
      ]
    : [
        { label: 'Privacy', href: '#' },
        { label: 'Terms',   href: '#' },
        { label: 'Contact', href: '#' },
      ];

  return (
    <footer className="border-t border-zinc-200 py-8 bg-[#FAFAF7]">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-brand-green" />
          <span className="font-semibold text-zinc-600">Pantry Pilot</span>
        </div>
        <nav className="flex gap-6">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-zinc-600 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <p>© {year} Pantry Pilot.</p>
      </div>
    </footer>
  );
}
