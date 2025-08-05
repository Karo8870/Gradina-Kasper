'use client';

import { ReactNode } from 'react';
import { cn } from '@heroui/react';
import { usePathname } from 'next/navigation';

function CheckoutProgressItem({
  children,
  index,
  currentIndex
}: {
  children: ReactNode;
  index: number;
  currentIndex: number;
}) {
  return (
    <div className='flex grow basis-0 flex-col items-center justify-center gap-2'>
      <div
        className={cn(
          'h-4 w-full rounded-full',
          index < currentIndex ? 'bg-primary-500' : 'bg-zinc-300'
        )}
      />
      <label
        className={cn(
          index === currentIndex ? 'font-bold' : 'font-medium',
          index < currentIndex
            ? 'text-primary-700'
            : index === currentIndex
              ? 'text-black'
              : 'text-black/60'
        )}
      >
        {children}
      </label>
    </div>
  );
}

const items = [
  'Coș de cumpărături',
  'Detalii de contact',
  'Ridicare comandă',
  'Metodă de plată'
];

const pathnames = [
  '/basket',
  '/checkout/details',
  '/checkout/pickup',
  '/checkout/payment'
];

export default function CheckoutProgress() {
  const pathname = usePathname();

  return (
    <div className='flex gap-2'>
      {items.map((item, index) => (
        <CheckoutProgressItem
          currentIndex={pathnames.indexOf(pathname)}
          index={index}
          key={index}
        >
          {item}
        </CheckoutProgressItem>
      ))}
    </div>
  );
}
