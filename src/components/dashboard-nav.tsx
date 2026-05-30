'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBasket, BookOpen, LogOut, Home } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LocaleSwitcher } from './locale-switcher';

export function DashboardNav({
  user,
  locale,
}: {
  user: Pick<User, 'name' | 'email'>;
  locale: string;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const utils = trpc.useUtils();
  const { signOut } = useAuth();

  const navItems = [
    {
      href: `/${locale}/`,
      label: t('home'),
      icon: Home,
      onHover: () => void utils.dashboard.getDashboardData.prefetch(),
    },
    {
      href: `/${locale}/pantry`,
      label: t('pantry'),
      icon: ShoppingBasket,
      onHover: () => void utils.pantry.getItems.prefetch(),
    },
    {
      href: `/${locale}/recipes`,
      label: t('recipes'),
      icon: BookOpen,
      onHover: () => void utils.recipes.getSavedRecipes.prefetch({ limit: 12 }),
    },
  ];

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center gap-6">
        <span className="font-bold text-lg">Pantry Pilot</span>
        <nav className="flex gap-1">
          {navItems.map(({ href, label, icon: Icon, onHover }) => (
            <Link
              key={href}
              href={href}
              onMouseEnter={onHover}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
          <LocaleSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('signOut')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
