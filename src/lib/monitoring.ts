import * as Sentry from '@sentry/nextjs';

export function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' = 'info',
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string } | null): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  Sentry.setUser(user);
}
