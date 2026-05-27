import { useTranslations } from 'next-intl';
import { Leaf } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/login-form';

function LoginPageContent() {
  const t = useTranslations('auth');

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(circle at 1px 1px, rgba(161,120,95,0.12) 1px, transparent 0)',
        backgroundSize: '28px 28px',
        backgroundColor: 'hsl(var(--background))',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-200">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pantry{' '}
            <span className="text-orange-500">Pilot</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t('loginSubtitle')}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">{t('loginTitle')}</h2>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
