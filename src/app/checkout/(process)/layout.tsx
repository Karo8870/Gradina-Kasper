import { ReactNode } from 'react';
import CheckoutProgress from '@/components/checkout-progress';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className='flex w-full max-w-[45rem] flex-col items-stretch gap-16 px-4 pt-12 sm:px-6'>
      <CheckoutProgress />
      {children}
    </main>
  );
}
