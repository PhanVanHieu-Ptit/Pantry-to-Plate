import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale, defaultLocale } from './i18n.config';

export { locales, type Locale, defaultLocale };

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale as Locale)) notFound();

  const messages =
    locale === 'vi'
      ? (await import('../messages/vi.json')).default
      : (await import('../messages/en.json')).default;

  return { locale, messages };
});
