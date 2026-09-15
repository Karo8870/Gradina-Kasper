import type { MetadataRoute } from 'next';

import envConfig from '../../env.config';

export default function robots(): MetadataRoute.Robots {
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/']
    },
    sitemap: `${baseURL}/sitemap.xml`
  };
}
