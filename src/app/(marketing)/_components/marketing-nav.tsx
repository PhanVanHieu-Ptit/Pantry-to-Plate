'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLang } from '../_context/lang';
import { cn } from '@/lib/utils';

const NAV_LINKS = {
  vi: [
    { label: 'Tính năng',    href: '#features'      },
    { label: 'Cách dùng',    href: '#how-it-works'  },
    { label: 'Bảng giá',     href: '#pricing'       },
  ],
  en: [
    { label: 'Features',     href: '#features'      },
    { label: 'How it works', href: '#how-it-works'  },
    { label: 'Pricing',      href: '#pricing'       },
  ],
};

export function MarketingNav() {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = NAV_LINKS[lang];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#FAFAF7]/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Leaf className="h-5 w-5 text-brand-green" />
          <span>
            Pantry{' '}
            <span className="text-brand-orange">Pilot</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-colors text-zinc-600"
          >
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${lang}/login`}>
              {lang === 'vi' ? 'Đăng nhập' : 'Sign in'}
            </Link>
          </Button>

          <Button
            size="sm"
            className="bg-brand-green hover:bg-brand-green/90 text-white rounded-lg px-4"
            asChild
          >
            <Link href={`/${lang}/register`}>
              {lang === 'vi' ? 'Dùng miễn phí' : 'Get started free'}
            </Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="text-xs font-semibold px-2 py-1 rounded border border-zinc-300 text-zinc-600"
          >
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-[#FAFAF7]">
              <div className="flex flex-col gap-6 pt-8">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-base text-zinc-700 hover:text-zinc-900 font-medium"
                  >
                    {l.label}
                  </Link>
                ))}
                <hr className="border-zinc-200" />
                <Link
                  href={`/${lang}/login`}
                  onClick={() => setOpen(false)}
                  className="text-base text-zinc-600"
                >
                  {lang === 'vi' ? 'Đăng nhập' : 'Sign in'}
                </Link>
                <Button
                  className="bg-brand-green hover:bg-brand-green/90 text-white rounded-lg"
                  asChild
                >
                  <Link href={`/${lang}/register`} onClick={() => setOpen(false)}>
                    {lang === 'vi' ? 'Dùng miễn phí' : 'Get started free'}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
