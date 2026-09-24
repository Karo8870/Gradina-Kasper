import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { ArticleCard } from '@/components/articles/article-card';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { RenderMedia } from '@/components/render-media';
import { getCMS } from '@/lib/cms';
import { generateDocumentMetadata } from '@/lib/generate-metadata';
import { staticMetadata } from '@/lib/static-metadata';
import type { Article, Media } from '@/payload-types';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const getArticleBySlug = cache(async (slug: string) => {
  const payload = await getCMS();
  const { docs } = await payload.find({
    collection: 'articles',
    depth: 2,
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
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return staticMetadata('Articol indisponibil', '', `/did-you-know/${slug}`, {
      noIndex: true
    });
  }

  return generateDocumentMetadata({
    doc: article,
    fallbackDescription: article.description,
    fallbackTitle: article.title,
    pathname: `/did-you-know/${article.slug}`
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const thumbnail =
    typeof article.thumbnail === 'object' ? (article.thumbnail as Media) : null;
  const relatedArticles = (article.relatedArticles ?? []).filter(
    (related): related is Article =>
      typeof related === 'object' && related !== null
  );

  return (
    <article className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      <header className='space-y-4'>
        <h1 className='text-4xl font-semibold tracking-tight'>
          {article.title}
        </h1>
        <p className='text-muted-foreground text-lg'>{article.description}</p>
      </header>

      {thumbnail ? (
        <RenderMedia
          alt={thumbnail.alt || article.title}
          className='w-full rounded-2xl object-cover'
          src={thumbnail}
        />
      ) : null}

      <CmsRichText data={article.content} />

      {relatedArticles.length ? (
        <section className='space-y-5 border-t pt-8'>
          <h2 className='text-2xl font-semibold'>Vezi și</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard article={relatedArticle} key={relatedArticle.id} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
