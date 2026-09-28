'use client';

import { useCart } from '@payloadcms/plugin-ecommerce/client/react';
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { markProductViewed } from '@/components/products/viewed-product-link';
import type { Cart } from '@/payload-types';

export function ProductCartControls({
  appearance = 'default',
  availabilityNotice,
  detailsHref,
  inventory,
  productID,
  productName,
  purchasable
}: {
  appearance?: 'compact' | 'default' | 'featured';
  availabilityNotice: string | null;
  detailsHref?: string;
  inventory: number;
  productID: number;
  productName?: string;
  purchasable: boolean;
}) {
  const cartState = useCart();
  const cart = cartState.cart as Cart | undefined;
  const { addItem, decrementItem, incrementItem, isLoading } = cartState;
  const currentItem = useMemo(
    () =>
      (cart?.items ?? []).find((item) => {
        const id =
          item.product && typeof item.product === 'object'
            ? item.product.id
            : item.product;

        return id === productID;
      }),
    [cart?.items, productID]
  );
  const quantity = currentItem?.quantity ?? 0;
  const remainingStock = Math.max(inventory - quantity, 0);
  const stockNotice =
    remainingStock === 0
      ? 'Stoc epuizat'
      : remainingStock < 10
        ? `${remainingStock} în stoc`
        : 'În stoc';
  const canAdd = purchasable && remainingStock > 0 && !isLoading;
  const featured = appearance === 'featured';
  const compact = appearance === 'compact';

  return (
    <div className={featured ? 'flex flex-col gap-4' : 'flex flex-col gap-3'}>
      <div
        className={
          compact
            ? 'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium sm:text-sm'
            : 'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium'
        }
      >
        {availabilityNotice ? <span>{availabilityNotice}</span> : null}
        {purchasable ? <span>{stockNotice}</span> : null}
        {currentItem ? (
          <span className='text-primary-700 inline-flex items-center gap-1 font-semibold'>
            <Check aria-hidden='true' className='size-3.5' />
            În coș
          </span>
        ) : null}
      </div>

      <div className={detailsHref ? 'grid grid-cols-2 gap-3' : undefined}>
        {detailsHref ? (
          <Button
            nativeButton={false}
            render={<Link href={detailsHref} />}
            className='h-14'
            onClick={() => markProductViewed(productID)}
            size='lg'
            variant='outline'
          >
            Vezi detalii
          </Button>
        ) : null}

        {currentItem ? (
          <div className='flex justify-center'>
            <div className='w-full overflow-hidden'>
              <div
                className={
                  compact
                    ? 'bg-primary-600 hover:bg-primary-700 flex h-11 items-center gap-1 rounded-xl p-1 transition-colors duration-300 sm:h-14 sm:gap-3 sm:rounded-[20px] sm:p-2'
                    : 'bg-primary-600 hover:bg-primary-700 flex h-14 items-center gap-3 rounded-[20px] p-2 transition-colors duration-300'
                }
              >
                <button
                  aria-label='Scade cantitatea'
                  className={
                    compact
                      ? 'flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40 sm:size-10 sm:rounded-[14px]'
                      : 'flex size-10 items-center justify-center rounded-[14px] border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40'
                  }
                  disabled={!currentItem.id || isLoading}
                  onClick={() => {
                    if (currentItem.id) void decrementItem(currentItem.id);
                  }}
                  type='button'
                >
                  <Minus className={compact ? 'size-4 sm:size-5' : undefined} />
                </button>
                <span
                  className={
                    compact
                      ? 'min-w-0 flex-1 text-center text-sm font-semibold text-white sm:min-w-10 sm:text-base'
                      : 'min-w-10 flex-1 text-center text-base font-semibold text-white'
                  }
                >
                  {quantity}
                </span>
                <button
                  aria-label='Crește cantitatea'
                  className={
                    compact
                      ? 'flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40 sm:size-10 sm:rounded-[14px]'
                      : 'flex size-10 items-center justify-center rounded-[14px] border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40'
                  }
                  disabled={!currentItem.id || !canAdd}
                  onClick={() => {
                    if (currentItem.id) void incrementItem(currentItem.id);
                  }}
                  type='button'
                >
                  <Plus className={compact ? 'size-4 sm:size-5' : undefined} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            aria-label={
              compact && purchasable && productName
                ? `Adaugă ${productName} în coș`
                : undefined
            }
            className={
              compact
                ? 'h-11 w-full px-2 text-xs sm:h-14 sm:text-base'
                : 'h-14 w-full text-base'
            }
            disabled={!canAdd}
            onClick={() => void addItem({ product: productID })}
            size={compact ? 'default' : 'lg'}
          >
            {purchasable ? (
              <ShoppingCart aria-hidden='true' className='size-4' />
            ) : null}
            {purchasable ? 'Adaugă' : 'Indisponibil'}
          </Button>
        )}
      </div>
    </div>
  );
}
