import type { Metadata } from 'next';
import type { GlobalSlug } from 'payload';

import type { Media } from '@/payload-types';

import envConfig from '../../env.config';
import { getCMS } from './cms';

const defaultTitle = '';
const defaultDescription = '';

type MetadataDocument = {
  meta?: {
    title?: string | null;
    image?: (number | null) | Media;
    description?: string | null;
  };
};

function absoluteURL(pathname: string) {
  return new URL(pathname, envConfig.NEXT_PUBLIC_SERVER_URL).toString();
}

export function generateDocumentMetadata({
  doc,
  fallbackDescription = defaultDescription,
  fallbackTitle = defaultTitle,
  pathname
}: {
  doc?: MetadataDocument | null;
  fallbackDescription?: string;
  fallbackTitle?: string;
  pathname: string;
}): Metadata {
  const title = doc?.meta?.title || fallbackTitle;
  const description = doc?.meta?.description || fallbackDescription;
  const canonicalURL = absoluteURL(pathname);
  const image =
    typeof doc?.meta?.image === 'object' && doc.meta.image?.url
      ? absoluteURL(doc.meta.image.url)
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalURL
    },
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      url: canonicalURL
    },
    twitter: {
      title,
      description,
      card: image ? 'summary_large_image' : 'summary',
      images: image ? [image] : undefined
    }
  };
}

export async function generateGlobalMetadata<T extends GlobalSlug>(
  slug: T,
  options: {
    fallbackDescription?: string;
    fallbackTitle?: string;
    pathname: string;
  }
) {
  const payload = await getCMS();

  const doc = (await payload.findGlobal({
    slug,
    depth: 1,
    overrideAccess: false
  })) as MetadataDocument;

  return generateDocumentMetadata({ doc, ...options });
}
