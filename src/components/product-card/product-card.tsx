'use client';

import ProductCardButton from '@/components/product-card/product-card-button';
import { Stepper } from '@/components/stepper';
import { cn, useDisclosure } from '@heroui/react';
import Image, { StaticImageData } from 'next/image';
import ProductModal from './product-modal';
import { useBasketContext } from '@/lib/providers/basket-provider';

export default function ProductCard({
  id,
  title,
  price,
  unit,
  image,
  quantityInCart = 0,
  inStock,
  disabled = false
}: {
  id: number;
  title: string;
  price: number;
  unit: string;
  image: StaticImageData | string;
  defaultQuantity?: number;
  quantityInCart: number;
  inStock: number;
  disabled?: boolean;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { basket, setProduct } = useBasketContext();

  const quantity = basket.find((el) => el.id === id)?.quantity;

  return (
    <>
      <div className='flex flex-col gap-3 overflow-hidden rounded-3xl bg-white shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.25)] max-sm:gap-2 max-sm:shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.17)]'>
        <div className='relative flex aspect-[2/1] w-full items-center justify-center bg-zinc-100'>
          {image === '' ? (
            <i className='fa fa-image text-4xl' />
          ) : (
            <Image
              className='object-cover'
              src={image}
              alt='Product Image'
              fill
            />
          )}
        </div>
        <div className='flex grow flex-col justify-between gap-3 px-4 pb-4 max-sm:px-3 max-sm:pb-3'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col'>
              <h1 className='text-lg leading-tight font-bold text-black max-sm:text-base'>
                {title}
              </h1>
              <label className='text-base leading-tight font-bold text-black/70 max-sm:text-sm'>
                {price} lei/{unit}
              </label>
            </div>
            <div
              className={cn(
                'overflow-hidden rounded-2xl bg-zinc-100 max-sm:hidden',
                (inStock <= 0 || disabled) && 'opacity-30'
              )}
            >
              <div className='flex h-10 items-center justify-between border-b border-b-black/5 bg-zinc-100 pl-4'>
                <label className='text-sm font-bold text-black/60'>
                  Cantitate
                </label>
                <Stepper
                  max={inStock}
                  value={quantity ?? 0}
                  setValue={(value) => {
                    setProduct(id, value);
                  }}
                />
              </div>
              <div className='flex h-10 items-center justify-between bg-zinc-100 px-4'>
                <label className='text-sm font-bold text-black/60'>
                  Preț total
                </label>
                <label className='text-base font-bold text-black/80'>
                  {price * (quantity ?? 0)} lei
                </label>
              </div>
            </div>
          </div>
          <ProductCardButton
            {...{
              quantityInCart,
              inStock,
              disabled,
              onAddToCart: () => {},
              onRemoveFromCart: () => {},
              unit
            }}
            onDesktopButtonClick={() => {
              if (quantityInCart === 0) {
                // onAddToCart(defaultQuantity);
              } else {
                // onRemoveFromCart();
              }
            }}
            onMobileButtonClick={onOpen}
          />
        </div>
      </div>
      <ProductModal
        {...{
          isOpen,
          onOpenChange,
          title,
          price,
          unit,
          image,
          id,
          inStock
        }}
      />
    </>
  );
}
