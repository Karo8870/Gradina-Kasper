import { RichText } from '@payloadcms/richtext-lexical/react';
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getProductAvailability, isProductExpired } from '@/commerce/products';
import { ProductCartControls } from '@/components/products/product-cart-controls';
import { ProductPrice } from '@/components/products/product-price';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductVegetables } from '@/components/products/product-vegetables';
import { Button } from '@/components/ui/button';
import { getCMS } from '@/lib/cms';
import { generateDocumentMetadata } from '@/lib/generate-metadata';
import { staticMetadata } from '@/lib/static-metadata';
import type { Media } from '@/payload-types';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getProductBySlug = cache(async (slug: string) => {
  const payload = await getCMS();
  const { docs } = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  const product = docs[0] ?? null;

  return product && !isProductExpired(product) ? product : null;
});

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return staticMetadata('Produs indisponibil', '', `/products/${slug}`, {
      noIndex: true
    });
  }

  const description = product.description
    ? convertLexicalToPlaintext({ data: product.description }).slice(0, 160)
    : `Descoperă ${product.name}.`;

  return generateDocumentMetadata({
    doc: product,
    fallbackDescription: description,
    fallbackTitle: product.name,
    pathname: `/products/${product.slug}`
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const availability = getProductAvailability(product);
  const images = (product.gallery ?? [])
    .map(({ image }) => (typeof image === 'object' ? image : null))
    .filter((image): image is Media => Boolean(image));
  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6'>
      <Button
        className='mb-5'
        nativeButton={false}
        render={<Link href='/products' />}
        variant='ghost'
      >
        <ChevronLeft data-icon='inline-start' />
        Toate produsele
      </Button>

      <article className='bg-card grid gap-8 rounded-3xl border p-5 md:grid-cols-2 md:p-8'>
        <ProductGallery images={images} productName={product.name} />
        <section className='flex flex-col gap-5'>
          <div className='flex items-start justify-between gap-4'>
            <h1 className='text-3xl font-semibold tracking-tight'>
              {product.name}
            </h1>
            <p className='shrink-0 text-xl font-semibold'>
              <ProductPrice product={product} />
            </p>
          </div>

          <p className='text-muted-foreground text-sm'>
            Prețul include TVA. Costurile de livrare nu sunt incluse.
          </p>

          {product.description ? (
            <RichText
              className='text-muted-foreground space-y-4 leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5'
              data={product.description}
            />
          ) : null}

          <ProductVegetables possibleVegetables={product.possibleVegetables} />

          <div className='mt-auto pt-3'>
            <ProductCartControls
              availabilityNotice={availability.notice}
              inventory={product.inventory ?? 0}
              productID={product.id}
              purchasable={availability.purchasable}
            />
          </div>
        </section>
      </article>
    </div>
  );
}
