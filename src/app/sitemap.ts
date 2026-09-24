import type { MetadataRoute } from 'next';

import { isProductExpired } from '@/commerce/products';
import { getCMS } from '@/lib/cms';

import envConfig from '../../env.config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');
  const payload = await getCMS();
  const [{ docs: products }, { docs: pages }, { docs: articles }] =
    await Promise.all([
      payload.find({
        collection: 'products',
        depth: 0,
        overrideAccess: false,
        pagination: false,
        select: {
          availability: true,
          slug: true,
          updatedAt: true
        }
      }),
      payload.find({
        collection: 'pages',
        depth: 0,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
          updatedAt: true
        }
      }),
      payload.find({
        collection: 'articles',
        depth: 0,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
          updatedAt: true
        }
      })
    ]);

  const entries: MetadataRoute.Sitemap = [
    '/',
    '/products',
    '/about-us',
    '/did-you-know',
    '/faq',
    '/pickup-point',
    '/support'
  ].map((path) => ({ url: `${baseURL}${path}` }));

  entries.push(
    ...products
      .filter((product) => !isProductExpired(product))
      .map((product) => ({
        lastModified: product.updatedAt,
        url: `${baseURL}/products/${product.slug}`
      })),
    ...pages.map((page) => ({
      lastModified: page.updatedAt,
      url: `${baseURL}/${page.slug}`
    })),
    ...articles.map((article) => ({
      lastModified: article.updatedAt,
      url: `${baseURL}/did-you-know/${article.slug}`
    }))
  );

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  );
}
