'use client';

import { Stepper } from '@/components/stepper';
import { useBasketContext } from '@/lib/providers/basket-provider';

export function EditableBasketItem({
  available,
  item
}: {
  available: boolean;
  item: {
    image: string;
    name: string;
    price: number;
    quantity: number;
    id: number;
    inStock: number;
  };
}) {
  const { setProduct } = useBasketContext();

  return (
    <div className='flex items-center gap-4 border-b border-b-black/10 pb-5'>
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
      <div className='flex grow flex-col items-center sm:flex-row'>
        <div className='flex w-full grow basis-0 flex-row justify-between sm:w-auto sm:flex-col'>
          <div className='flex flex-col'>
            <label className='text-xl font-bold text-black'>{item.name}</label>
            <label className='text-[1.125rem] font-bold text-black/70'>
              {item.price} lei/kg
            </label>
          </div>
          <div className='flex items-center gap-1'>
            {available ? (
              <>
                <i className='fa fa-check-circle text-[1.125rem] text-green-500' />
                <label className='text-[1.125rem] font-semibold text-green-500'>
                  În stoc
                </label>
              </>
            ) : (
              <>
                <i className='fa fa-check-circle text-[1.125rem] text-red-500' />
                <label className='text-[1.125rem] font-semibold text-red-500'>
                  Stoc epuizat
                </label>
              </>
            )}
          </div>
        </div>
        <div className='hidden grow basis-0 justify-center sm:flex'>
          <Stepper
            max={item.inStock}
            value={item.quantity ?? 0}
            setValue={(value) => {
              setProduct(item.id, value);
            }}
          />
        </div>
        <div className='flex w-full grow basis-0 items-center justify-between sm:w-auto sm:justify-end'>
          <div className='flex sm:hidden'>
            <Stepper
              max={item.inStock}
              value={item.quantity ?? 0}
              setValue={(value) => {
                setProduct(item.id, value);
              }}
            />
          </div>
          <label className='text-xl font-bold text-black'>
            {item.price * item.quantity} lei
          </label>
        </div>
      </div>
    </div>
  );
}
