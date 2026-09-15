import type { GlobalSlug } from 'payload';

import type { Media } from '@/payload-types';

import envConfig from '../../env.config';
import { getCMS } from './cms';

const defaultTitle = '';
const defaultDescription = '';
const defaultImage = '';

export async function generateGlobalMetadata<T extends GlobalSlug>(slug: T) {
  const payload = await getCMS();

  const doc = (await payload.findGlobal({
    slug
  })) as {
    meta?: {
      title?: string | null;
      image?: (number | null) | Media;
      description?: string | null;
    };
  };

  const title = doc?.meta?.title ?? defaultTitle;
  const description = doc?.meta?.description ?? defaultDescription;
  const image =
    typeof doc?.meta?.image === 'object' && doc.meta.image
      ? (doc.meta.image.url ?? defaultImage)
      : defaultImage;

  return {
    description,
    title,
    openGraph: {
      title,
      description,
      url: envConfig.NEXT_PUBLIC_SERVER_URL,
      images: [image]
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: [image]
    }
  };
}
