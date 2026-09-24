import { ArticleCard } from '@/components/articles/article-card';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';

export default async function DidYouKnowPage() {
  const payload = await getCMS();
  const [page, { docs: articles }] = await Promise.all([
    payload.findGlobal({
      slug: 'did-you-know-page',
      depth: 1,
      overrideAccess: false
    }),
    payload.find({
      collection: 'articles',
      depth: 1,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedOn'
    })
  ]);

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6'>
      <header className='max-w-3xl space-y-3'>
        <h1 className='text-4xl font-semibold tracking-tight'>
          {page.title || 'Știai că...'}
        </h1>
        <CmsRichText data={page.didYouKnowContent} />
      </header>

      {articles.length ? (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </div>
      ) : (
        <div className='bg-muted/40 rounded-xl border border-dashed p-10 text-center'>
          Nu există articole publicate momentan.
        </div>
      )}
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('did-you-know-page', {
    fallbackDescription: 'Articole și informații utile.',
    fallbackTitle: 'Știai că...',
    pathname: '/did-you-know'
  });
}
