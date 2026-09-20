'use client';

import {
  useCart,
  useCurrency
} from '@payloadcms/plugin-ecommerce/client/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { RenderMedia } from '@/components/render-media';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import type { Cart, Media } from '@/payload-types';

type CartItem = NonNullable<Cart['items']>[number];

function populatedProduct(item: CartItem) {
  return typeof item.product === 'object' && item.product ? item.product : null;
}

export function CartDrawer() {
  const cartState = useCart();
  const cart = cartState.cart as Cart | undefined;
  const { decrementItem, incrementItem, isLoading, removeItem } = cartState;
  const { formatCurrency } = useCurrency();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = cart?.items ?? [];
  const quantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label='Deschide coșul'
            className='relative'
            size='icon-lg'
            variant='ghost'
          />
        }
      >
        <ShoppingCart />
        {quantity > 0 ? (
          <span className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold'>
            {quantity}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent className='w-full gap-0 sm:max-w-md'>
        <SheetHeader className='border-b px-6 py-5'>
          <SheetTitle>Coșul meu</SheetTitle>
          <SheetDescription>
            Gestionează produsele adăugate în coș.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center'>
            <div className='bg-muted flex size-16 items-center justify-center rounded-full'>
              <ShoppingCart className='size-7' />
            </div>
            <p className='text-lg font-semibold'>Coșul tău este gol.</p>
            <p className='text-muted-foreground text-sm'>
              Adaugă produse pentru a le vedea aici.
            </p>
          </div>
        ) : (
          <div className='flex min-h-0 flex-1 flex-col'>
            <ul className='flex-1 space-y-3 overflow-y-auto p-4'>
              {items.map((item, index) => {
                const product = populatedProduct(item);
                const image =
                  product && typeof product.gallery?.[0]?.image === 'object'
                    ? (product.gallery[0].image as Media)
                    : null;
                const price = product?.priceInRON;
                const atInventoryLimit =
                  typeof product?.inventory === 'number' &&
                  item.quantity >= product.inventory;

                return (
                  <li
                    className='bg-muted/40 flex gap-3 rounded-xl border p-3'
                    key={item.id ?? `${product?.id ?? 'item'}-${index}`}
                  >
                    <div className='bg-muted size-16 shrink-0 overflow-hidden rounded-lg'>
                      <RenderMedia
                        alt={product?.name ?? 'Produs'}
                        className='size-full object-cover'
                        src={image}
                      />
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col gap-2'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <p className='truncate font-medium'>
                            {product?.name ?? 'Produs indisponibil'}
                          </p>
                          {typeof price === 'number' ? (
                            <p className='text-muted-foreground text-sm'>
                              {formatCurrency(price, { locale: 'ro-RO' })}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          aria-label='Elimină produsul'
                          disabled={!item.id || isLoading}
                          onClick={() => {
                            if (item.id) void removeItem(item.id);
                          }}
                          size='icon-xs'
                          variant='ghost'
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          aria-label='Scade cantitatea'
                          disabled={!item.id || isLoading}
                          onClick={() => {
                            if (item.id) void decrementItem(item.id);
                          }}
                          size='icon-xs'
                          variant='outline'
                        >
                          <Minus />
                        </Button>
                        <span className='min-w-6 text-center text-sm font-medium'>
                          {item.quantity}
                        </span>
                        <Button
                          aria-label='Crește cantitatea'
                          disabled={!item.id || isLoading || atInventoryLimit}
                          onClick={() => {
                            if (item.id) void incrementItem(item.id);
                          }}
                          size='icon-xs'
                          variant='outline'
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className='border-t p-6'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>Subtotal</span>
                <span className='font-semibold'>
                  {formatCurrency(cart?.subtotal ?? 0, { locale: 'ro-RO' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
