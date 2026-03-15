import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Standalone output is enabled for production builds (APP_ENV=production).
  // Dev mode (next dev) ignores this setting entirely.
  output: process.env.APP_ENV === "production" ? "standalone" : undefined,
};

export default withNextIntl(nextConfig);
