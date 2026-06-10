'use client';

import { Button } from '@/components/ui/button';
import type { Product } from '@/payload-types';

import { useCart } from '@payloadcms/plugin-ecommerce/client/react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

type Props = {
  product: Product;
};

export function AddToCart({ product }: Props) {
  const { addItem, cart, isLoading } = useCart();
  const searchParams = useSearchParams();

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();

      addItem({
        product: product.id
      }).then(() => {
        toast.success('Item added to cart.');
      });
    },
    [addItem, product]
  );

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID =
        typeof item.product === 'object' ? item.product?.id : item.product;

      if (productID === product.id) {
        return true;
      }
    });

    if (existingItem) {
      const existingQuantity = existingItem.quantity;
      return existingQuantity >= (product.inventory || 0);
    }

    if (product.inventory === 0) {
      return true;
    }

    return false;
  }, [cart?.items, product]);

  return (
    <Button
      aria-label='Add to cart'
      variant={'outline'}
      className={clsx({
        'hover:opacity-90': true
      })}
      disabled={disabled || isLoading}
      onClick={addToCart}
      type='submit'
    >
      Add To Cart
    </Button>
  );
}
