import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { getProductAvailability } from '@/commerce/products';
import { CmsRichText } from '@/components/content/cms-rich-text';
import { ProductCartControls } from '@/components/products/product-cart-controls';
import { ProductPrice } from '@/components/products/product-price';
import { RenderMedia } from '@/components/render-media';
import type { Media, Product } from '@/payload-types';

export function FeaturedProductCard({
  product,
  productsLinkLabel,
  sectionTitle
}: {
  product: Product;
  productsLinkLabel: string;
  sectionTitle: string;
}) {
  const availability = getProductAvailability(product);
  const href = `/products/${product.slug}`;
  const image =
    typeof product.gallery?.[0]?.image === 'object'
      ? (product.gallery[0].image as Media)
      : null;
  return (
    <section
      aria-labelledby='featured-product-heading'
      className='bg-card grid overflow-hidden rounded-[1.5rem] border border-neutral-200 lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[2rem]'
    >
      <h2 className='sr-only'>{sectionTitle}</h2>
      <Link
        aria-label={`Vezi ${product.name}`}
        className='bg-muted relative block min-h-72 overflow-hidden sm:min-h-96 lg:min-h-[31rem]'
        href={href}
      >
        <RenderMedia
          alt={product.name}
          className='absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.015]'
          src={image}
        />
      </Link>
      <div className='flex flex-col p-6 sm:p-8 lg:p-10'>
        <div className='flex items-start justify-between gap-5'>
          <h2
            className='text-primary-950 text-3xl leading-tight font-bold sm:text-4xl'
            id='featured-product-heading'
          >
            {product.name}
          </h2>
          <p className='text-primary-950 shrink-0 text-xl font-bold tabular-nums sm:text-2xl'>
            <ProductPrice product={product} />
          </p>
        </div>
        {product.description ? (
          <CmsRichText
            className='text-muted-foreground mt-6 line-clamp-5 leading-relaxed'
            data={product.description}
          />
        ) : null}
        <div className='mt-auto pt-8'>
          <ProductCartControls
            appearance='featured'
            availabilityNotice={availability.notice}
            inventory={product.inventory ?? 0}
            productID={product.id}
            purchasable={availability.purchasable}
          />
          <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
            <Link
              className='text-primary-900 hover:text-primary-700 inline-flex items-center gap-2 font-semibold underline decoration-neutral-300 transition-colors'
              href={href}
            >
              Vezi detalii
              <ArrowRight className='size-4' />
            </Link>
            <Link
              className='text-muted-foreground hover:text-primary-900 text-sm font-semibold transition-colors'
              href='/products'
            >
              {productsLinkLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
