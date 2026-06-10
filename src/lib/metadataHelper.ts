import { getPayload, GlobalSlug } from 'payload';
import config from '@payload-config';
import { Media } from '@/payload-types';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';

export async function generateGlobalMetadata<T extends GlobalSlug>(slug: T) {
  const payload = await getPayload({ config });

  const doc = (await payload.findGlobal({
    slug
  })) as {
    meta: {
      title?: string | null;
      image?: (number | null) | Media;
      description?: string | null;
    };
    title?: string | null;
  };

  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.meta.image.url}`;

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      ...(doc?.meta?.description
        ? {
            description: doc?.meta?.description
          }
        : {}),
      images: ogImage
        ? [
            {
              url: ogImage
            }
          ]
        : undefined,
      title: doc?.meta?.title || doc?.title || 'Payload Ecommerce Template'
    }),
    title: doc?.meta?.title || doc?.title || 'Payload Ecommerce Template'
  };
}

const x = generateGlobalMetadata('home-page');
