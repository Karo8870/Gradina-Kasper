'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@payloadcms/plugin-ecommerce/client/react';
import type { Product } from '@/payload-types';
import { MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { cn } from '@/utilities/cn';

type Props = {
  product: Product;
};

export function ProductBasketControls({ product }: Props) {
  const { addItem, cart, decrementItem, incrementItem, isLoading } = useCart();

  const currentItem = useMemo(() => {
    return cart?.items?.find((item) => {
      const productID =
        typeof item.product === 'object' ? item.product?.id : item.product;

      if (productID !== product.id) return false;

      return true;
    });
  }, [cart?.items, product.id]);

  const quantity = currentItem?.quantity ?? 0;

  const addToBasket = useCallback(() => {
    addItem({
      product: product.id
    });
  }, [addItem, product.id]);

  const increment = useCallback(() => {
    if (currentItem?.id) {
      incrementItem(currentItem.id);
    }
  }, [currentItem?.id, incrementItem]);

  const decrement = useCallback(() => {
    if (currentItem?.id) {
      if (quantity <= 1) {
        decrementItem(currentItem.id);
        return;
      }

      decrementItem(currentItem.id);
    }
  }, [currentItem?.id, decrementItem, quantity]);

  const disabled = useMemo(() => {
    const stock = product.inventory || 0;

    return stock <= 0 || isLoading;
  }, [isLoading, product.inventory]);

  if (!currentItem) {
    return (
      <Button
        className='bg-primary-600 hover:bg-primary-700 h-14 w-full rounded-[20px] text-base font-semibold text-white'
        disabled={disabled}
        onClick={addToBasket}
        type='button'
      >
        <ShoppingCart className='size-4' />
        Adaugă în coș
      </Button>
    );
  }

  return (
    <div className='flex justify-center'>
      <div
        className={cn(
          'overflow-hidden transition-[width,background-color,box-shadow,padding] duration-300 ease-out',
          currentItem ? 'w-[198px]' : 'w-full'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-[20px] bg-primary-600 p-2 transition-colors duration-300 hover:bg-primary-700'
          )}
        >
          <button
            aria-label='Scade cantitatea'
            className='flex size-11 items-center justify-center rounded-[16px] border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40'
            disabled={isLoading}
            onClick={decrement}
            type='button'
          >
            <MinusIcon className='size-4' />
          </button>

          <span className='min-w-10 flex-1 text-center text-base font-semibold text-white'>
            {quantity}
          </span>

          <button
            aria-label='Adaugă încă unul'
            className='flex size-11 items-center justify-center rounded-[16px] border border-white/20 bg-white/15 text-white transition-all duration-300 hover:bg-white/25 disabled:opacity-40'
            disabled={isLoading || quantity >= (product.inventory || 0)}
            onClick={increment}
            type='button'
          >
            <PlusIcon className='size-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
