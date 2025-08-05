'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Badge } from '@heroui/badge';
import { CartPopup } from '@/components/cart-popup/cart-popup';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@heroui/react';
import Link from 'next/link';
import { products } from '@/db/schema/products';
import { useBasketContext } from '@/lib/providers/basket-provider';

export function CartPopupTrigger({
  apiProducts
}: {
  apiProducts: (typeof products.$inferSelect)[];
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { basket } = useBasketContext();

  return (
    <>
      <Link href='/basket' className='flex sm:hidden'>
        <CartButton amount={basket.length} />
      </Link>
      <Popover
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        placement='bottom'
      >
        <PopoverTrigger>
          <div className='hidden sm:flex'>
            <CartButton amount={basket.length} />
          </div>
        </PopoverTrigger>
        <PopoverContent className='flex h-[32.5rem] flex-col items-stretch p-10'>
          <CartPopup
            onClose={() => {
              setIsOpen(false);
            }}
            apiProducts={apiProducts}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

function CartButton({ amount }: { amount: number }) {
  const pathname = usePathname();

  return (
    <div
      className={cn('cursor-pointer', pathname === '/' ? 'block' : 'hidden')}
    >
      <Badge
        content={amount}
        classNames={{
          badge: 'bg-red-400 text-white font-bold text-xs'
        }}
      >
        <i className='fa fa-shopping-cart text-3xl' />
      </Badge>
    </div>
  );
}
