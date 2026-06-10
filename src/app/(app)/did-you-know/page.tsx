import { generateGlobalMetadata } from '@/lib/metadataHelper';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { ArticleCard } from '@/components/ArticleBox';
import Section from '@/components/Section';

export async function generateMetadata() {
  return generateGlobalMetadata('did-you-know-page');
}

export default async function DidYouKnowPage() {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: config });

  const didYouKnow = await payload.findGlobal({
    slug: 'did-you-know-page'
  });

  const result = await payload.find({
    collection: 'articles',
    depth: 1,
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
    sort: '-publishedOn',
    where: {
      and: [
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published'
                }
              }
            ])
      ]
    }
  });

  const articles = result.docs.filter((article) => Boolean(article.slug));

  return (
    <Section
      className='container pt-24'
      title={didYouKnow.title}
      description={didYouKnow.didYouKnowContent}
    >
      <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {articles.map((article) => (
          <li key={article.id}>
            <ArticleCard {...article} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
