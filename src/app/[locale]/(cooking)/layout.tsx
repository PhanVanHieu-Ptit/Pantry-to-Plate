import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';

export default async function CookingLayout({
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
  return <>{children}</>;
}
