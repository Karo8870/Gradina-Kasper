'use client';

import { Stepper } from '@/components/stepper';
import { useBasketContext } from '@/lib/providers/basket-provider';

export function CartPopupItem({
  item,
  available = true
}: {
  item: {
    image: string;
    name: string;
    price: number;
    quantity: number;
    id: number;
    inStock: number;
  };
  available?: boolean;
}) {
  const { setProduct } = useBasketContext();

  return (
    <div className='flex gap-4'>
      {item.image ? (
        <img
          className='h-[6.25rem] w-[6.25rem] rounded-[1.25rem] object-cover'
          src={item.image}
          alt={item.name}
        />
      ) : (
        <div className='flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-[1.25rem] bg-zinc-100'>
          <i className='fa fa-image text-4xl' />
        </div>
      )}
      <div className='flex grow flex-col justify-between'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <h1 className='text-xl font-bold text-black'>{item.name}</h1>
            <label className='text-[1.125rem] font-bold text-black/70'>
              {item.price} lei/kg
            </label>
          </div>
          <div className='flex items-center gap-1'>
            {available ? (
              <>
                <label className='text-[1.125rem] font-semibold text-green-500'>
                  În stoc
                </label>
                <i className='fa fa-check-circle text-[1.125rem] text-green-500' />
              </>
            ) : (
              <>
                <label className='text-[1.125rem] font-semibold text-red-500'>
                  Stoc epuizat
                </label>
                <i className='fa fa-check-circle text-[1.125rem] text-red-500' />
              </>
            )}
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <Stepper
            max={item.inStock}
            value={item.quantity ?? 0}
            setValue={(value) => {
              setProduct(item.id, value);
            }}
          />
          <label className='text-[1.125rem] font-bold text-black'>
            {item.price * item.quantity} lei
          </label>
        </div>
      </div>
    </div>
  );
}
