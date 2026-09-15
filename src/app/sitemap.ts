import type { MetadataRoute } from 'next';

import envConfig from '../../env.config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');

  return [
    {
      url: `${baseURL}/`
    }
  ];
}
