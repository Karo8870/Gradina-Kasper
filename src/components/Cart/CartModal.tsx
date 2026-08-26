'use client';

import { Price } from '@/components/Price';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  useCart,
  useCurrency
} from '@payloadcms/plugin-ecommerce/client/react';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DeleteItemButton } from './DeleteItemButton';
import { EditItemQuantityButton } from './EditItemQuantityButton';
import { OpenCartButton } from './OpenCart';
import { Button } from '@/components/ui/button';
import { Product } from '@/payload-types';

export function CartModal({
  minimumDeliveryOrderAmount
}: {
  minimumDeliveryOrderAmount: string;
}) {
  const { cart } = useCart();
  const { currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false);
  }, [pathname]);

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined;
    return cart.items.reduce(
      (quantity, item) => (item.quantity || 0) + quantity,
      0
    );
  }, [cart]);

  const currencyCode = cart?.currency ?? currency.code ?? 'RON';
  const minimumDeliveryOrderAmountValue = Number(minimumDeliveryOrderAmount);
  const getItemPrice = useCallback(
    (item: any) => {
      const product = item.product;
      const variant = item.variant;

      if (typeof product !== 'object' || !product) {
        return undefined;
      }

      const basePrice =
        product.hasDiscount && product.discountedPrice
          ? Number(product.discountedPrice)
          : Number(product.price);

      if (variant && typeof variant === 'object') {
        const variantPrice =
          currencyCode === 'EUR' ? variant.priceInEUR : variant.priceInRON;
        const parsedVariantPrice = Number(variantPrice);

        if (Number.isFinite(parsedVariantPrice)) {
          return parsedVariantPrice;
        }
      }

      return Number.isFinite(basePrice) ? basePrice : undefined;
    },
    [currencyCode]
  );

  const subtotal = useMemo(() => {
    if (typeof cart?.subtotal === 'number' && Number.isFinite(cart.subtotal)) {
      return cart.subtotal;
    }

    if (!cart?.items?.length) {
      return undefined;
    }

    return cart.items.reduce((total, item: any) => {
      const itemPrice = getItemPrice(item);

      if (typeof itemPrice !== 'number') {
        return total;
      }

      return total + itemPrice * (item.quantity || 0);
    }, 0);
  }, [cart?.items, cart?.subtotal, getItemPrice]);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className='flex w-full max-w-md flex-col gap-0 border-l border-neutral-200 bg-white p-0'>
        <SheetHeader className='border-b border-neutral-200 px-6 py-5 text-left'>
          <SheetTitle className='text-primary-900 text-xl font-semibold'>
            Coșul meu
          </SheetTitle>

          <SheetDescription className='mt-1 text-sm text-neutral-600'>
            Gestionează produsele din coș și continuă către finalizarea
            comenzii.
          </SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center'>
            <div className='bg-secondary-100 text-primary-900 flex h-16 w-16 items-center justify-center rounded-full'>
              <ShoppingCart className='h-8 w-8' />
            </div>
            <p className='text-primary-900 text-xl font-semibold'>
              Coșul tău este gol.
            </p>
            <p className='text-sm text-neutral-600'>
              Adaugă produse pentru a continua spre plată.
            </p>
          </div>
        ) : (
          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='flex min-h-0 w-full flex-1 flex-col'>
              <ul className='flex-1 space-y-3 overflow-y-auto px-4 py-4'>
                {cart?.items?.map((item: any, i: number) => {
                  const product = item.product;
                  const variant = item.variant;

                  if (
                    typeof product !== 'object' ||
                    !item ||
                    !product ||
                    !product.slug
                  )
                    return <React.Fragment key={i} />;

                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined;

                  let image = firstGalleryImage;
                  const price = getItemPrice(item);

                  const isVariant =
                    Boolean(variant) && typeof variant === 'object';

                  if (isVariant) {
                    const imageVariant = product.gallery?.find(
                      (galleryItem: any) => {
                        if (!galleryItem.variantOption) return false;
                        const variantOptionID =
                          typeof galleryItem.variantOption === 'object'
                            ? galleryItem.variantOption.id
                            : galleryItem.variantOption;

                        const hasMatch = variant?.options?.some(
                          (option: any) => {
                            if (typeof option === 'object')
                              return option.id === variantOptionID;
                            else return option === variantOptionID;
                          }
                        );

                        return hasMatch;
                      }
                    );

                    if (
                      imageVariant &&
                      typeof imageVariant.image === 'object'
                    ) {
                      image = imageVariant.image;
                    }
                  }

                  return (
                    <li
                      className='bg-secondary-50/40 space-y-3 rounded-2xl border border-neutral-200 p-3'
                      key={i}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <Link
                          className='flex min-w-0 flex-1 flex-row gap-3'
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className='bg-secondary-100 relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200'>
                            <Image
                              alt={image?.alt || product?.name || ''}
                              className='h-full w-full object-cover'
                              height={96}
                              src={image?.url || '/no-image.png'}
                              width={96}
                            />
                          </div>

                          <div className='min-w-0 flex-1'>
                            <p className='text-primary-900 truncate text-sm font-semibold'>
                              {product?.name}
                            </p>
                            {isVariant && variant ? (
                              <p className='mt-1 truncate text-xs text-neutral-600 capitalize'>
                                {variant.options
                                  ?.map((option: any) => {
                                    if (typeof option === 'object')
                                      return option.label;
                                    return null;
                                  })
                                  .join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </Link>

                        <DeleteItemButton item={item} />
                      </div>

                      <div className='flex items-center justify-between gap-3'>
                        {typeof price === 'number' ? (
                          <Price
                            amount={price}
                            className='text-primary-900 text-sm font-semibold'
                            currencyCode={currencyCode}
                          />
                        ) : (
                          <span className='text-sm font-semibold text-neutral-500'>
                            -
                          </span>
                        )}

                        <div className='flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-2 py-1'>
                          <EditItemQuantityButton item={item} type='minus' />
                          <span className='text-primary-900 min-w-5 text-center text-sm font-semibold'>
                            {item.quantity}
                          </span>
                          <EditItemQuantityButton item={item} type='plus' />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className='mt-auto border-t border-neutral-200 px-6 py-4'>
                <div className='text-sm text-neutral-600'>
                  <div className='bg-primary-50/60 border-primary-100 mb-4 rounded-xl border px-3 py-2 text-xs text-primary-900'>
                    Pentru livrare, comanda minimă este{' '}
                    <Price
                      amount={minimumDeliveryOrderAmountValue}
                      as='span'
                      className='font-semibold'
                      currencyCode='RON'
                    />
                    .
                  </div>

                  {typeof subtotal === 'number' && (
                    <div className='mb-4 flex items-center justify-between'>
                      <p className='font-medium text-neutral-700'>Total</p>
                      <Price
                        amount={subtotal}
                        className='text-primary-900 text-right text-lg font-bold'
                        currencyCode={currencyCode}
                      />
                    </div>
                  )}

                  <Button
                    asChild
                    className='bg-primary-900 hover:bg-primary-800 h-11 w-full rounded-full text-sm font-semibold text-white'
                  >
                    <Link href='/checkout'>Continuă către plată</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
