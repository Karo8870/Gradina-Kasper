import type { MetadataRoute } from 'next';

import { getServerSideURL } from '@/utilities/getURL';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL();

  return {
    host: baseUrl,
    rules: [
      {
        allow: '/',
        disallow: [
          '/account',
          '/account/',
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/checkout',
          '/checkout/',
          '/login',
          '/logout',
          '/create-account',
          '/forgot-password',
          '/verify-email',
          '/confirm-password-reset',
          '/orders',
          '/orders/'
        ],
        userAgent: '*'
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
