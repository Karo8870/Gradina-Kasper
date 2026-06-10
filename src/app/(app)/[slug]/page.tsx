import type { Metadata } from 'next';
import { generateMeta } from '@/utilities/generateMeta';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React from 'react';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/RichText';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true
    }
  });

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home';
    })
    .map(({ slug }) => {
      return { slug };
    });

  return params;
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params;

  let page = await queryPageBySlug({
    slug
  });

  if (!page) {
    return notFound();
  }

  return (
    <article className='pt-24 mx-auto max-w-3xl'>
      <h1 className='text-primary-900 mb-8 text-4xl font-bold tracking-tight md:text-5xl'>
        {page.title}
      </h1>

      <RichText
        data={page.Content}
        className='prose-p:text-neutral-700 prose-headings:text-primary-900 prose-strong:text-primary-950 !mx-0 !px-0'
      />
    </article>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params;

  const page = await queryPageBySlug({
    slug
  });

  return generateMeta({ doc: page });
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug
          }
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }])
      ]
    }
  });

  return result.docs?.[0] || null;
};
