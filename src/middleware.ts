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
      return NextResponse.redirect(new URL(`/${locale}/pantry`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
