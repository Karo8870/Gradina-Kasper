import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { CmsRichText } from '@/components/content/cms-rich-text';
import { getCMS } from '@/lib/cms';
import { generateDocumentMetadata } from '@/lib/generate-metadata';
import { staticMetadata } from '@/lib/static-metadata';

type GenericPageProps = {
  params: Promise<{ slug: string }>;
};

const getPageBySlug = cache(async (slug: string) => {
  const payload = await getCMS();
  const { docs } = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  return docs[0] ?? null;
});

export async function generateMetadata({
  params
}: GenericPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return staticMetadata('Pagină indisponibilă', '', `/${slug}`, {
      noIndex: true
    });
  }

  return generateDocumentMetadata({
    doc: page,
    fallbackDescription: convertLexicalToPlaintext({
      data: page.content
    }).slice(0, 160),
    fallbackTitle: page.title,
    pathname: `/${page.slug}`
  });
}

export default async function GenericPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <article className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      <h1 className='text-4xl font-semibold tracking-tight'>{page.title}</h1>
      <CmsRichText data={page.content} />
    </article>
  );
}
