'use client';

import { useCart } from '@payloadcms/plugin-ecommerce/client/react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { Cart } from '@/payload-types';

export function ProductCartControls({
  availabilityNotice,
  detailsHref,
  inventory,
  productID,
  purchasable
}: {
  availabilityNotice: string | null;
  detailsHref?: string;
  inventory: number;
  productID: number;
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

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap gap-2'>
        {availabilityNotice ? (
          <span className='bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase'>
            {availabilityNotice}
          </span>
        ) : null}
        {purchasable ? (
          <span className='bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase'>
            {stockNotice}
          </span>
        ) : null}
      </div>

      <div className={detailsHref ? 'grid grid-cols-2 gap-3' : undefined}>
        {detailsHref ? (
          <Button
            nativeButton={false}
            render={<Link href={detailsHref} />}
            size='lg'
            variant='outline'
          >
            Vezi detalii
          </Button>
        ) : null}

        {currentItem ? (
          <div className='bg-primary text-primary-foreground grid h-9 grid-cols-[2.25rem_1fr_2.25rem] items-center overflow-hidden rounded-lg'>
            <Button
              aria-label='Scade cantitatea'
              className='rounded-none text-current hover:bg-white/15 hover:text-current'
              disabled={!currentItem.id || isLoading}
              onClick={() => {
                if (currentItem.id) void decrementItem(currentItem.id);
              }}
              size='icon-lg'
              variant='ghost'
            >
              <Minus />
            </Button>
            <span className='text-center text-sm font-semibold'>
              {quantity}
            </span>
            <Button
              aria-label='Crește cantitatea'
              className='rounded-none text-current hover:bg-white/15 hover:text-current'
              disabled={!currentItem.id || !canAdd}
              onClick={() => {
                if (currentItem.id) void incrementItem(currentItem.id);
              }}
              size='icon-lg'
              variant='ghost'
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <Button
            className='w-full'
            disabled={!canAdd}
            onClick={() => void addItem({ product: productID })}
            size='lg'
          >
            <ShoppingCart data-icon='inline-start' />
            {purchasable ? 'Adaugă în coș' : 'Indisponibil'}
          </Button>
        )}
      </div>
    </div>
  );
}
