import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

const protectedPatterns = ['/pantry', '/recipes'];
const authPatterns = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through all API routes without locale processing
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/ai/')) {
      const hasSession = !!request.cookies.get('better-auth.session_token');
      if (!hasSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const res = NextResponse.next();
      res.headers.set('X-RateLimit-Limit', '10');
      res.headers.set('X-RateLimit-Policy', '10;w=86400');
      return res;
    }
    return NextResponse.next();
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, '') || '/';

  const isProtected = protectedPatterns.some((p) => pathnameWithoutLocale.startsWith(p));
  const isAuthPage = authPatterns.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected || isAuthPage) {
    const hasSession = !!request.cookies.get('better-auth.session_token');
    const locale = (pathname.split('/')[1] as string) ?? defaultLocale;

    if (isProtected && !hasSession) {
      const url = new URL(`/${locale}/login`, request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthPage && hasSession) {
      return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }
  }

  // Serve the marketing landing page at root without locale-prefix redirect
  if (pathname === '/') return NextResponse.next();

  return intlMiddleware(request);
}

export const config = {
  // Remove the `api` exclusion so /api/ai/* is processed by this middleware.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
