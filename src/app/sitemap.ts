import type { MetadataRoute } from 'next';

import { getCMS } from '@/lib/cms';

import envConfig from '../../env.config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');
  const payload = await getCMS();
  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      updatedAt: true
    }
  });

  return [
    {
      url: `${baseURL}/`
    },
    {
      url: `${baseURL}/products`
    },
    ...products.map((product) => ({
      lastModified: product.updatedAt,
      url: `${baseURL}/products/${product.slug}`
    }))
  ];
}
