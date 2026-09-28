import { CarIcon, RotateCcw, ShoppingBasket } from 'lucide-react';

import { isProductExpired } from '@/commerce/products';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { ProductCard } from '@/components/products/product-card';
import { RenderMedia } from '@/components/render-media';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';
import type { Media } from '@/payload-types';

const howItWorksCardStyles = [
  {
    icon: ShoppingBasket,
    textClass: 'text-secondary-700',
    baseClass: 'bg-secondary-50'
  },
  {
    icon: CarIcon,
    textClass: 'text-[#3F6A2B]',
    baseClass: 'bg-[#DDF7D1]'
  },
  {
    icon: RotateCcw,
    textClass: 'text-primary-700',
    baseClass: 'bg-primary-100'
  }
] as const;

export default async function ProductsPage() {
  const payload = await getCMS();
  const [{ docs: products }, { docs: vegetables }, productsPage] =
    await Promise.all([
      payload.find({
        collection: 'products',
        depth: 2,
        limit: 100,
        overrideAccess: false,
        pagination: false
      }),
      payload.find({
        collection: 'vegetables',
        depth: 1,
        limit: 1000,
        overrideAccess: false,
        pagination: false
      }),
      payload.findGlobal({
        slug: 'products-page',
        depth: 1,
        overrideAccess: false
      })
    ]);
  const visibleProducts = products.filter(
    (product) => !isProductExpired(product)
  );
  const productByID = new Map(
    visibleProducts.map((product) => [product.id, product])
  );
  const featuredProducts = (productsPage.featuredProducts ?? []).flatMap(
    (featuredProduct) => {
      const id =
        typeof featuredProduct === 'object'
          ? featuredProduct.id
          : featuredProduct;
      const product = productByID.get(id);

      return product ? [product] : [];
    }
  );
  const featuredProductIDs = new Set(
    featuredProducts.map((product) => product.id)
  );
  const gridProducts = visibleProducts.filter(
    (product) => !featuredProductIDs.has(product.id)
  );
  const steps = [productsPage.step1, productsPage.step2, productsPage.step3];

  console.log(products);

  return (
    <div className='mx-auto flex w-full max-w-[86rem] flex-col gap-20 px-5 py-16 sm:px-8 lg:px-12'>
      <section className='space-y-10'>
        <header className='max-w-3xl'>
          <h1 className='text-primary-950 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance'>
            {productsPage.boxesSectionTitle || 'Produse'}
          </h1>
          <CmsRichText
            className='text-muted-foreground mt-5 max-w-[65ch] leading-relaxed'
            data={productsPage.boxesSectionContent}
          />
        </header>
        {visibleProducts.length ? (
          <div className='space-y-14'>
            {featuredProducts.length ? (
              <section
                aria-labelledby='featured-boxes-heading'
                className='space-y-6'
              >
                <h2
                  className='text-primary-950 text-2xl font-bold tracking-[-0.02em] sm:text-3xl'
                  id='featured-boxes-heading'
                >
                  În prim-plan
                </h2>
                <div className='flex flex-col gap-6'>
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}

            {gridProducts.length ? (
              <section
                aria-labelledby={
                  featuredProducts.length ? 'all-boxes-heading' : undefined
                }
                className='space-y-6'
              >
                {featuredProducts.length ? (
                  <h2
                    className='text-primary-950 text-2xl font-bold tracking-[-0.02em] sm:text-3xl'
                    id='all-boxes-heading'
                  >
                    Toate boxurile
                  </h2>
                ) : null}
                <div className='grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3'>
                  {gridProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant='grid'
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className='bg-muted rounded-2xl border border-dashed border-neutral-300 p-10 text-center'>
            <p className='font-medium'>
              Nu există produse disponibile momentan.
            </p>
          </div>
        )}
      </section>

      {steps.some((step) => step?.title || step?.description) ? (
        <section className='space-y-8'>
          <div>
            <h2 className='text-primary-900 text-3xl font-bold md:text-4xl'>
              {productsPage.howItWorksTitle || 'Cum funcționează'}
            </h2>
            <CmsRichText
              className='mt-2 text-neutral-700'
              data={productsPage.howItWorksContent}
            />
          </div>
          <div className='grid gap-4 lg:grid-cols-3'>
            {howItWorksCardStyles.map((style, index) => {
              const content = steps[index];
              if (!content?.title && !content?.description) return null;

              const Icon = style.icon;

              return (
                <article
                  className={`flex items-center gap-6 rounded-[3.75rem] px-8 py-6 md:h-56 md:px-10 ${style.baseClass}`}
                  key={`${content.title}-${index}`}
                >
                  <div className='flex size-[4.5rem] shrink-0 items-center justify-center rounded-full bg-white p-5'>
                    <Icon
                      className={`size-8 ${style.textClass}`}
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex min-w-0 flex-col'>
                    <h3 className={`text-xl font-bold ${style.textClass}`}>
                      {content.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${style.textClass}`}
                    >
                      {content.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {vegetables.length ? (
        <section className='space-y-6'>
          <div className='max-w-2xl'>
            <h2 className='text-primary-950 text-3xl font-bold tracking-[-0.02em]'>
              {productsPage.whatsInYourBoxTitle ||
                'Ce poate ajunge în boxul tău?'}
            </h2>
            <CmsRichText data={productsPage.whatsInYourBoxContent} />
          </div>
          <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'>
            {vegetables.map((vegetable) => {
              const image =
                typeof vegetable.image === 'object'
                  ? (vegetable.image as Media)
                  : null;

              return (
                <li className='space-y-2 text-center' key={vegetable.id}>
                  <div className='bg-muted aspect-square overflow-hidden rounded-xl border border-neutral-200'>
                    <RenderMedia
                      alt={image?.alt || vegetable.name}
                      className='size-full object-cover'
                      src={image}
                    />
                  </div>
                  <p className='text-sm font-medium'>{vegetable.name}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('products-page', {
    fallbackDescription: 'Descoperă produsele disponibile în magazin.',
    fallbackTitle: 'Produse',
    pathname: '/products'
  });
}
