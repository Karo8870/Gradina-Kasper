import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { cn } from '@/utilities/cn';

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <button
      aria-label='Open cart'
      className={cn(
        'relative inline-flex items-center justify-center text-primary-800 transition-colors cursor-pointer',
        className
      )}
      {...rest}
    >
      <ShoppingCart className='size-5 md:size-6' />

      {quantity ? (
        <span className='bg-primary-900 aspect-square text-white absolute -top-1 -right-1 flex w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none'>
          {quantity}
        </span>
      ) : null}
    </button>
  );
}
