import config from '@payload-config';
import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';

import { getServerSideURL } from '@/utilities/getURL';

type SitemapEntry = MetadataRoute.Sitemap[number];

const staticRoutes: Array<{
  changeFrequency: SitemapEntry['changeFrequency'];
  path: string;
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/products', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about-us', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/did-you-know', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/pickup-point', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/support', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/find-order', changeFrequency: 'monthly', priority: 0.3 }
];

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const createEntry = ({
  baseUrl,
  changeFrequency,
  lastModified,
  path,
  priority
}: {
  baseUrl: string;
  changeFrequency: SitemapEntry['changeFrequency'];
  lastModified?: string | Date | null;
  path: string;
  priority: number;
}): SitemapEntry => ({
  changeFrequency,
  lastModified: lastModified ? new Date(lastModified) : new Date(),
  priority,
  url: `${baseUrl}${path}`
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const baseUrl = normalizeBaseUrl(getServerSideURL());

  const [pages, products, articles] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true
      },
      where: {
        _status: {
          equals: 'published'
        }
      }
    }),
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true
      },
      where: {
        and: [
          {
            _status: {
              equals: 'published'
            }
          },
          {
            hideProduct: {
              equals: false
            }
          }
        ]
      }
    }),
    payload.find({
      collection: 'articles',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true
      },
      where: {
        _status: {
          equals: 'published'
        }
      }
    })
  ]);

  const entries = [
    ...staticRoutes.map((route) =>
      createEntry({
        ...route,
        baseUrl
      })
    ),
    ...pages.docs.map((page) =>
      createEntry({
        baseUrl,
        changeFrequency: 'monthly',
        lastModified: page.updatedAt,
        path: `/${page.slug}`,
        priority: 0.6
      })
    ),
    ...products.docs.map((product) =>
      createEntry({
        baseUrl,
        changeFrequency: 'daily',
        lastModified: product.updatedAt,
        path: `/products/${product.slug}`,
        priority: 0.8
      })
    ),
    ...articles.docs.map((article) =>
      createEntry({
        baseUrl,
        changeFrequency: 'weekly',
        lastModified: article.updatedAt,
        path: `/did-you-know/${article.slug}`,
        priority: 0.6
      })
    )
  ];

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  );
}
