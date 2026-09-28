import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import { getProductAvailability } from '@/commerce/products';
import { ProductCartControls } from '@/components/products/product-cart-controls';
import { ProductPrice } from '@/components/products/product-price';
import { ProductVegetables } from '@/components/products/product-vegetables';
import { ViewedProductLink } from '@/components/products/viewed-product-link';
import { RenderMedia } from '@/components/render-media';
import type { Media, Product } from '@/payload-types';

export function ProductCard({
  product,
  variant = 'featured'
}: {
  product: Product;
  variant?: 'featured' | 'grid';
}) {
  const availability = getProductAvailability(product);
  const href = `/products/${product.slug}`;
  const image =
    typeof product.gallery?.[0]?.image === 'object'
      ? (product.gallery[0].image as Media)
      : null;
  const description = product.description
    ? convertLexicalToPlaintext({ data: product.description })
    : '';
  const compact = variant === 'grid';
  return (
    <article
      className={
        compact
          ? 'bg-card hover:border-neutral-400 active:border-primary-500 focus-within:ring-primary-400/50 relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 transition-[transform,border-color,box-shadow] duration-150 focus-within:ring-2 active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100'
          : 'bg-card hover:border-neutral-400 active:border-primary-500 focus-within:ring-primary-400/50 relative grid overflow-hidden rounded-3xl border border-neutral-200 transition-[transform,border-color,box-shadow] duration-150 focus-within:ring-2 active:scale-[0.992] motion-reduce:transition-none motion-reduce:active:scale-100 md:grid-cols-2'
      }
    >
      <ViewedProductLink
        href={href}
        productID={product.id}
        productName={product.name}
      />
      <div
        className={
          compact
            ? 'bg-muted relative aspect-[4/3]'
            : 'bg-muted relative min-h-72'
        }
      >
        <RenderMedia
          alt={product.name}
          className='absolute inset-0 size-full object-cover'
          src={image}
        />
      </div>
      <div
        className={
          compact
            ? 'flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5'
            : 'flex flex-col gap-5 p-6 md:p-8'
        }
      >
        <div
          className={
            compact
              ? 'flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'
              : 'flex items-start justify-between gap-4'
          }
        >
          <h2
            className={
              compact
                ? 'text-primary-950 text-base leading-tight font-bold break-words sm:text-xl'
                : 'text-primary-950 text-2xl font-bold md:text-3xl'
            }
          >
            {product.name}
          </h2>
          <p
            className={
              compact
                ? 'text-primary-950 text-sm font-bold tabular-nums sm:shrink-0 sm:text-base'
                : 'text-primary-950 shrink-0 text-lg font-bold tabular-nums'
            }
          >
            <ProductPrice product={product} />
          </p>
        </div>
        {description ? (
          <p
            className={
              compact
                ? 'text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:line-clamp-3 sm:text-sm'
                : 'text-muted-foreground line-clamp-4 leading-relaxed'
            }
          >
            {description}
          </p>
        ) : null}
        {!compact ? (
          <ProductVegetables possibleVegetables={product.possibleVegetables} />
        ) : null}
        <div className='relative z-10 mt-auto'>
          <ProductCartControls
            appearance={compact ? 'compact' : 'default'}
            availabilityNotice={availability.notice}
            detailsHref={compact ? undefined : href}
            inventory={product.inventory ?? 0}
            productID={product.id}
            productName={product.name}
            purchasable={availability.purchasable}
          />
        </div>
      </div>
    </article>
  );
}
