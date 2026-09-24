import { isProductExpired } from '@/commerce/products';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { ProductCard } from '@/components/products/product-card';
import { RenderMedia } from '@/components/render-media';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';
import type { Media } from '@/payload-types';

export default async function ProductsPage() {
  const payload = await getCMS();
  const [{ docs: products }, { docs: vegetables }, productsPage] =
    await Promise.all([
      payload.find({
        collection: 'products',
        depth: 2,
        limit: 100,
        overrideAccess: false,
        pagination: false,
        sort: 'name'
      }),
      payload.find({
        collection: 'vegetables',
        depth: 1,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        sort: 'name'
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
  const steps = [
    productsPage.step1,
    productsPage.step2,
    productsPage.step3
  ].filter((step) => step?.title || step?.description);

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6'>
      <section className='space-y-8'>
        <header className='max-w-2xl'>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
            {productsPage.boxesSectionTitle || 'Produse'}
          </h1>
          <CmsRichText data={productsPage.boxesSectionContent} />
        </header>
        {visibleProducts.length ? (
          <div className='flex flex-col gap-6'>
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className='bg-muted/40 rounded-2xl border border-dashed p-10 text-center'>
            <p className='font-medium'>
              Nu există produse disponibile momentan.
            </p>
          </div>
        )}
      </section>

      {steps.length ? (
        <section className='space-y-6'>
          <div className='max-w-2xl'>
            <h2 className='text-3xl font-semibold tracking-tight'>
              {productsPage.howItWorksTitle || 'Cum funcționează'}
            </h2>
            <CmsRichText data={productsPage.howItWorksContent} />
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            {steps.map((step, index) => (
              <Card key={`${step.title}-${index}`}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {vegetables.length ? (
        <section className='space-y-6'>
          <div className='max-w-2xl'>
            <h2 className='text-3xl font-semibold tracking-tight'>
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
                  <div className='bg-muted aspect-square overflow-hidden rounded-xl border'>
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
