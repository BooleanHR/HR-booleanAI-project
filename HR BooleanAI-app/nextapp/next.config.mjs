/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14에서는 experimental.serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer',
      'puppeteer-core',
      'puppeteer-extra',
      'puppeteer-extra-plugin-stealth',
      'better-sqlite3',
      '@prisma/adapter-better-sqlite3',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
