import Link from 'next/link';
import { payload } from '@/lib/payload';
import { Media } from '@/payload-types';

export default async function DidYouKnowPage() {
  const articles = await payload.find({
    collection: 'articles',
    sort: '-createdAt',
    limit: 100,
    depth: 1
  });

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        <h1 className='mb-10 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          Știai că...?
        </h1>

        {articles.docs.length ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {articles.docs.map((article) => {
              const articleImage =
                article.image && typeof article.image === 'object'
                  ? (article.image as Media)
                  : null;

              return (
                <Link
                  key={article.id}
                  href={`/did-you-know/${article.slug}`}
                  className='group block cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md'
                >
                  {articleImage?.url ? (
                    <img
                      src={articleImage.url}
                      alt={articleImage.alt}
                      className='h-52 w-full object-cover'
                    />
                  ) : null}
                  <div className='p-6'>
                    <h2 className='text-2xl font-semibold tracking-tight text-primary-900'>
                      {article.title}
                    </h2>

                    <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                      {article.description}
                    </p>

                    <span className='mt-4 inline-block text-sm font-semibold text-primary-700 underline underline-offset-4'>
                      Citește articolul
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className='text-muted-foreground'>Nu există articole publicate încă.</p>
        )}
      </div>
    </section>
  );
}
