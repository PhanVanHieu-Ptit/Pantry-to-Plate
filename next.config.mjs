import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    // zod-to-json-schema >=3.25 tries to import `zod/v3` (a Zod v4 subpath).
    // Our project uses Zod v3 which has no such export — redirect to root package.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^zod\/v3$/, 'zod'),
    );
    return config;
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG ?? '',
  project: process.env.SENTRY_PROJECT ?? '',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
