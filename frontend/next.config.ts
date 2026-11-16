import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  /** Optional same-origin proxy keeps preview browsers from calling server-local addresses. */
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    const parsed = new URL(target);
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.search ||
      parsed.hash ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error(
        'API_PROXY_TARGET must be an HTTP(S) API base URL without credentials, query, or hash',
      );
    }
    return [{ source: '/api/:path*', destination: `${target.replace(/\/$/, '')}/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};
export default nextConfig;
