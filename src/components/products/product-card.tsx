import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import Link from 'next/link';

import { storeCurrency } from '@/commerce/currencies';
import { getProductAvailability } from '@/commerce/products';
import { ProductCartControls } from '@/components/products/product-cart-controls';
import { RenderMedia } from '@/components/render-media';
import type { Media, Product } from '@/payload-types';

export function ProductCard({ product }: { product: Product }) {
  const availability = getProductAvailability(product);
  const href = `/products/${product.slug}`;
  const image =
    typeof product.gallery?.[0]?.image === 'object'
      ? (product.gallery[0].image as Media)
      : null;
  const description = product.description
    ? convertLexicalToPlaintext({ data: product.description })
    : '';
  const price = new Intl.NumberFormat('ro-RO', {
    currency: storeCurrency.code,
    maximumFractionDigits: storeCurrency.decimals,
    minimumFractionDigits: storeCurrency.decimals,
    style: 'currency'
  }).format((product.priceInRON ?? 0) / 10 ** storeCurrency.decimals);

  return (
    <article className='bg-card relative grid overflow-hidden rounded-3xl border md:grid-cols-2'>
      <Link
        aria-label={`Vezi ${product.name}`}
        className='absolute inset-0'
        href={href}
      >
        <span className='sr-only'>Vezi detaliile produsului</span>
      </Link>
      <div className='bg-muted relative min-h-72'>
        <RenderMedia
          alt={product.name}
          className='absolute inset-0 size-full object-cover'
          src={image}
        />
      </div>
      <div className='flex flex-col gap-5 p-6 md:p-8'>
        <div className='flex items-start justify-between gap-4'>
          <h2 className='text-2xl font-semibold md:text-3xl'>{product.name}</h2>
          <p className='shrink-0 text-lg font-semibold'>{price}</p>
        </div>
        {description ? (
          <p className='text-muted-foreground line-clamp-4 leading-relaxed'>
            {description}
          </p>
        ) : null}
        <div className='relative z-10 mt-auto'>
          <ProductCartControls
            availabilityNotice={availability.notice}
            detailsHref={href}
            inventory={product.inventory ?? 0}
            productID={product.id}
            purchasable={availability.purchasable}
          />
        </div>
      </div>
    </article>
  );
}
