import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { isProductExpired } from '@/commerce/products';
import { ArticleCard } from '@/components/articles/article-card';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { FeaturedProductCard } from '@/components/products/featured-product-card';
import { RenderMedia } from '@/components/render-media';
import { Button } from '@/components/ui/button';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';
import type { Article, Media, Product } from '@/payload-types';

export default async function HomePage() {
  const payload = await getCMS();
  const home = await payload.findGlobal({
    slug: 'home-page',
    depth: 3,
    overrideAccess: false
  });
  const heroImage =
    typeof home.heroBackgroundImage === 'object'
      ? (home.heroBackgroundImage as Media)
      : null;
  const featuredProduct =
    typeof home.featuredProduct === 'object' && home.featuredProduct
      ? (home.featuredProduct as Product)
      : null;
  const highlightedArticles = (home.highlightedArticles ?? []).filter(
    (article): article is Article =>
      typeof article === 'object' && article !== null
  );

  return (
    <div className='pb-20'>
      <section className='bg-muted relative h-svh overflow-hidden'>
        {heroImage ? (
          <RenderMedia
            alt={heroImage.alt || home.heroTitle || 'Grădina Kasper'}
            className='absolute inset-0 size-full object-cover'
            fetchPriority='high'
            src={heroImage}
          />
        ) : null}
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-linear-to-r from-white/70 to-transparent'
        />
        <div className='relative z-1 flex h-full flex-col justify-center px-8 md:px-36'>
          <div className='flex w-full flex-col items-start md:w-1/2'>
            <h1 className='text-primary-950 pb-8 text-3xl leading-tight font-bold whitespace-pre-line md:text-[4rem]'>
              {home.heroTitle || 'Bine ai venit la Grădina Kasper!'}
            </h1>
            {home.subtitle ? (
              <p className='text-primary-800 pb-10 text-xl leading-normal font-medium whitespace-pre-line'>
                {home.subtitle}
              </p>
            ) : null}
            <Button
              className='h-auto rounded-full px-5 py-3 text-base font-bold md:px-10 md:py-6 md:text-[1.125rem]'
              nativeButton={false}
              render={<Link href='/products' />}
              size='lg'
            >
              {home.callToActionText || 'Descoperă produsele noastre'}
            </Button>
          </div>
        </div>
      </section>

      <div className='mx-auto w-full max-w-[86rem] space-y-[clamp(5rem,9vw,8rem)] px-5 pt-[clamp(5rem,9vw,8rem)] sm:px-8 lg:px-12'>
        {featuredProduct && !isProductExpired(featuredProduct) ? (
          <section>
            <div className='mb-8 max-w-[46rem]'>
              <h2 className='text-primary-950 text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] font-bold text-balance'>
                {home.highlightBoxTitle || 'Produs recomandat'}
              </h2>
              <CmsRichText
                className='text-muted-foreground mt-4 max-w-[68ch] leading-relaxed'
                data={home.highlightBoxContent}
              />
            </div>
            <FeaturedProductCard
              product={featuredProduct}
              productsLinkLabel={
                home.callToActionText || 'Vezi toate produsele'
              }
              sectionTitle={home.highlightBoxTitle || 'Produs recomandat'}
            />
          </section>
        ) : null}

        {highlightedArticles.length ? (
          <section>
            <div className='mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-8'>
              <div className='max-w-[46rem]'>
                <h2 className='text-primary-950 text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] font-bold text-balance'>
                  {home.highlightArticlesTitle || 'Articole recomandate'}
                </h2>
                <CmsRichText
                  className='text-muted-foreground mt-4 max-w-[68ch] leading-relaxed'
                  data={home.highlightArticlesContent}
                />
              </div>
              <Link
                className='text-primary-900 hover:text-primary-700 inline-flex flex-none items-center gap-2 font-bold underline decoration-neutral-300 transition-colors'
                href='/did-you-know'
              >
                Vezi toate articolele
                <ArrowRight className='size-4' />
              </Link>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {highlightedArticles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('home-page', {
    fallbackDescription: 'Produse proaspete de la Grădina Kasper.',
    fallbackTitle: 'Grădina Kasper',
    pathname: '/'
  });
}
