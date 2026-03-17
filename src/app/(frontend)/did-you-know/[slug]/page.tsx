import Link from 'next/link';
import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { payload } from '@/lib/payload';
import { Media } from '@/payload-types';

export default async function ArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const articleData = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug
      }
    },

    limit: 1,
    depth: 1
  });

  const article = articleData.docs[0];

  if (!article) {
    return (
      <section className='mt-20 flex w-screen justify-center'>
        <div className='w-full max-w-[64rem] px-6'>
          <h1 className='text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
            Articolul nu a fost găsit
          </h1>
        </div>
      </section>
    );
  }

  const articleImage =
    article.image && typeof article.image === 'object'
      ? (article.image as Media)
      : null;

  const relatedIds = (article.alsoCheckOut ?? []).map((entry) =>
    typeof entry === 'number' ? entry : entry.id
  );

  const relatedData = relatedIds.length
    ? await payload.find({
        collection: 'articles',
        where: {
          and: [
            {
              id: {
                in: relatedIds
              }
            },
            {
              id: {
                not_equals: article.id
              }
            }
          ]
        },
        limit: 6,
        depth: 1
      })
    : await payload.find({
        collection: 'articles',
        where: {
          id: {
            not_equals: article.id
          }
        },
        sort: '-createdAt',
        limit: 6,
        depth: 1
      });

  const relatedArticles = relatedData.docs.slice(0, 6);

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        <Link
          href='/did-you-know'
          className='mb-6 inline-block text-sm font-medium text-muted-foreground underline underline-offset-4'
        >
          Înapoi la toate articolele
        </Link>

        <h1 className='mb-8 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          {article.title}
        </h1>

        <p className='mb-6 text-base leading-relaxed text-muted-foreground'>
          {article.description}
        </p>

        {articleImage?.url ? (
          <img
            src={articleImage.url}
            alt={articleImage.alt}
            className='mb-8 h-[300px] w-full rounded-2xl object-cover md:h-[420px]'
          />
        ) : null}

        <RichTextRenderer data={article.content} />

        {relatedArticles.length ? (
          <div className='mt-14'>
            <h2 className='text-2xl font-semibold tracking-tight text-primary-900'>
              Vezi și
            </h2>

            <Carousel
              opts={{
                align: 'start',
                loop: relatedArticles.length > 3
              }}
              className='mt-5'
            >
              <CarouselContent>
                {relatedArticles.map((relatedArticle) => {
                  const relatedImage =
                    relatedArticle.image && typeof relatedArticle.image === 'object'
                      ? (relatedArticle.image as Media)
                      : null;

                  return (
                    <CarouselItem
                      key={relatedArticle.id}
                      className='md:basis-1/2 lg:basis-1/3'
                    >
                      <Link
                        href={`/did-you-know/${relatedArticle.slug}`}
                        className='group block h-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'
                      >
                        {relatedImage?.url ? (
                          <img
                            src={relatedImage.url}
                            alt={relatedImage.alt}
                            className='h-40 w-full object-cover'
                          />
                        ) : null}
                        <div className='p-4'>
                          <h3 className='text-lg font-semibold text-primary-900'>
                            {relatedArticle.title}
                          </h3>
                          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                            {relatedArticle.description}
                          </p>
                          <span className='mt-3 inline-block text-sm font-semibold text-primary-700 underline underline-offset-4'>
                            Citește articolul
                          </span>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {relatedArticles.length > 1 ? (
                <>
                  <CarouselPrevious className='left-2 top-1/2' />
                  <CarouselNext className='right-2 top-1/2' />
                </>
              ) : null}
            </Carousel>
          </div>
        ) : null}
      </div>
    </section>
  );
}
