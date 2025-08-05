'use client';

import { EditableBasketItem } from '@/components/basket/editable-basket-item';
import { BasketItem } from '@/components/basket/basket-item';
import { useBasketContext } from '@/lib/providers/basket-provider';
import { products } from '@/db/schema/products';
import { ReactNode } from 'react';

export function Basket({
  children,
  editable = false,
  apiProducts
}: {
  children?: ReactNode;
  editable?: boolean;
  apiProducts: (typeof products.$inferSelect)[];
}) {
  const { basket } = useBasketContext();

  const items = basket.map((item) => {
    const product = apiProducts.find((el) => el.id === item.id);

    return {
      image: product?.image ?? '',
      name: product?.name ?? '',
      price: product?.priceWithTax ?? 0,
      quantity: item.quantity,
      id: item.id,
      inStock: product?.stock ?? 0
    };
  });

  return (
    <div className='flex flex-col gap-5'>
      {items.length > 0 ? (
        <>
          <div className='sticky left-0 top-[79px] z-50 hidden border-b border-b-black/10 bg-white pl-[7.25rem] sm:flex'>
            <label className='grow basis-0 text-xl font-medium text-black/60'>
              Nume
            </label>
            <label className='grow basis-0 text-center text-xl font-medium text-black/60'>
              Cantitate
            </label>
            <label className='grow basis-0 text-right text-xl font-medium text-black/60'>
              Preț
            </label>
          </div>
          {editable
            ? items.map((item, index) => (
                <EditableBasketItem item={item} key={index} available={true} />
              ))
            : items.map((item, index) => (
                <BasketItem item={item} key={index} />
              ))}
          <div className='flex justify-between'>
            <label className='text-xl font-bold text-black sm:text-2xl'>
              Total
            </label>
            <label className='text-xl font-bold text-black sm:text-2xl'>
              {items.reduce((sum, el) => el.price * el.quantity + sum, 0)} lei
            </label>
          </div>
          {children}
        </>
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <label className='max-w-72 text-center text-2xl font-bold sm:max-w-full'>
            Coșul de cumpărături este gol
          </label>
        </div>
      )}
    </div>
  );
}
