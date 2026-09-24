import Link from 'next/link';

import { ArticleCard } from '@/components/articles/article-card';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { ProductCard } from '@/components/products/product-card';
import { RenderMedia } from '@/components/render-media';
import { Button } from '@/components/ui/button';
import { isProductExpired } from '@/commerce/products';
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
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6'>
      <section className='bg-card overflow-hidden rounded-3xl border'>
        {heroImage ? (
          <RenderMedia
            alt={heroImage.alt || home.heroTitle || 'Grădina Kasper'}
            className='max-h-[32rem] w-full object-cover'
            src={heroImage}
          />
        ) : null}
        <div className='flex max-w-3xl flex-col items-start gap-5 p-6 sm:p-10'>
          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
            {home.heroTitle || 'Bine ai venit la Grădina Kasper!'}
          </h1>
          {home.subtitle ? (
            <p className='text-muted-foreground text-lg'>{home.subtitle}</p>
          ) : null}
          <Button
            nativeButton={false}
            render={<Link href='/products' />}
            size='lg'
          >
            {home.callToActionText || 'Descoperă produsele noastre'}
          </Button>
        </div>
      </section>

      {featuredProduct && !isProductExpired(featuredProduct) ? (
        <section className='space-y-6'>
          <div className='max-w-3xl space-y-3'>
            <h2 className='text-3xl font-semibold tracking-tight'>
              {home.highlightBoxTitle || 'Produs recomandat'}
            </h2>
            <CmsRichText data={home.highlightBoxContent} />
          </div>
          <ProductCard product={featuredProduct} />
        </section>
      ) : null}

      {highlightedArticles.length ? (
        <section className='space-y-6'>
          <div className='max-w-3xl space-y-3'>
            <h2 className='text-3xl font-semibold tracking-tight'>
              {home.highlightArticlesTitle || 'Articole recomandate'}
            </h2>
            <CmsRichText data={home.highlightArticlesContent} />
          </div>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {highlightedArticles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        </section>
      ) : null}
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
