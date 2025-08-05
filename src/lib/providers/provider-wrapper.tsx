'use client';

import { ReactNode } from 'react';
import { BasketContextProvider } from '@/lib/providers/basket-provider';
import { HeroUIProvider } from '@heroui/react';

export default function ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider className='flex h-full w-screen flex-col items-center'>
      <BasketContextProvider>{children}</BasketContextProvider>
    </HeroUIProvider>
  );
}
