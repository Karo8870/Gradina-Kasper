import { ArticleCard } from '@/components/ArticleBox';
import { RichText } from '@/components/RichText';
import RenderImage from '@/components/RenderImage';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { generateMeta } from '@/utilities/generateMeta';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const payload = await getPayload({ config: config });

  const articles = await payload.find({
    collection: 'articles',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true
    }
  });

  return articles.docs
    .filter((doc) => Boolean(doc.slug))
    .map(({ slug }) => {
      return { slug: slug };
    });
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await queryArticleBySlug({
    slug
  });

  return generateMeta({ doc: article as any });
}

export default async function ({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await queryArticleBySlug({ slug });

  if (!article) return notFound();

  const relatedArticles = article.relatedArticles?.filter((relatedArticle) => {
    return typeof relatedArticle === 'object' && relatedArticle !== null;
  });

  return (
    <article className='pt-24 mx-auto max-w-3xl'>
      <h1 className='text-primary-900 mb-8 text-4xl font-bold tracking-tight md:text-5xl'>
        {article.title}
      </h1>

      <p className='mb-6 text-lg text-neutral-600'>{article.description}</p>

      <RenderImage
        src={article.thumbnail}
        className='mb-8 h-auto w-full rounded-2xl object-cover'
      />

      <RichText
        data={article.content}
        className='prose-p:text-neutral-700 prose-headings:text-primary-900 prose-strong:text-primary-950 !mx-0 !px-0'
      />

      {relatedArticles !== null &&
        relatedArticles !== undefined &&
        relatedArticles.length > 0 && (
          <section className='pt-8'>
            <h2 className='text-primary-900 text-3xl font-semibold'>Vezi și</h2>

            <ul className='mt-5 grid gap-4 sm:grid-cols-2'>
              {relatedArticles.map((relatedArticle) => (
                <li key={relatedArticle.id}>
                  <ArticleCard {...relatedArticle} />
                </li>
              ))}
            </ul>
          </section>
        )}
    </article>
  );
}

const queryArticleBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: config });

  const result = await payload.find({
    collection: 'articles',
    depth: 2,
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
