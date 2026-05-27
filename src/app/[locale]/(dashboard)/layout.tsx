import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { DashboardNav } from '@/components/dashboard-nav';

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: headers() });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav user={session.user} locale={locale} />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
