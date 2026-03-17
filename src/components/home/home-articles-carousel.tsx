import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Article, Media } from '@/payload-types';

type Props = {
  articles: Article[];
};

function asMedia(value: number | Media | null | undefined) {
  if (!value || typeof value === 'number') {
    return null;
  }

  return value;
}

export function HomeArticlesCarousel({ articles }: Props) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className='flex flex-col gap-5 pb-6'>
      <div className='flex items-end justify-between gap-4'>
        <h2 className='text-primary-900 text-2xl font-bold tracking-tight sm:text-3xl'>
          Articole recente
        </h2>
        <Link
          href='/did-you-know'
          className='text-primary-700 text-sm font-semibold underline underline-offset-4'
        >
          Vezi toate articolele
        </Link>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: articles.length > 3
        }}
        className='mx-1'
      >
        <CarouselContent>
          {articles.map((article) => {
            const image = asMedia(article.image);

            return (
              <CarouselItem
                key={article.id}
                className='md:basis-1/2 lg:basis-1/3'
              >
                <Link
                  href={`/did-you-know/${article.slug}`}
                  className='group border-border bg-card block h-full cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md'
                >
                  {image?.url ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className='h-52 w-full object-cover'
                    />
                  ) : (
                    <div className='bg-secondary-50 h-52 w-full' />
                  )}

                  <div className='p-6'>
                    <h3 className='text-primary-900 line-clamp-2 text-2xl font-semibold tracking-tight'>
                      {article.title}
                    </h3>
                    <p className='text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed'>
                      {article.description}
                    </p>
                    <span className='text-primary-700 mt-4 inline-block text-sm font-semibold underline underline-offset-4'>
                      Citește articolul
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {articles.length > 1 ? (
          <>
            <CarouselPrevious className='top-1/2 left-2' />
            <CarouselNext className='top-1/2 right-2' />
          </>
        ) : null}
      </Carousel>
    </section>
  );
}
