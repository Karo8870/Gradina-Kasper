import Link from 'next/link';
import { CartPopupTrigger } from '@/components/cart-popup/cart-popup-trigger';
import Account from '@/components/skeleton/account';
import { getSession } from '@/lib/api/auth';
import { getProducts } from '@/lib/api/products';

export async function Header() {
  const session = await getSession();

  const products = await getProducts();

  return (
    <header className='fixed left-0 top-0 z-[100] flex w-screen bg-white px-4 py-3 md:px-24'>
      <div className='hidden grow basis-0 md:block' />
      <Link
        href='/'
        className='flex grow cursor-pointer items-center justify-start gap-2 md:justify-center'
      >
        <img className='w-8 md:w-14' src='/logo.svg' alt='logo' />
        <h1 className='text-base font-bold text-primary-950 md:text-3xl'>
          Grădina Kasper
        </h1>
      </Link>
      <div className='flex grow basis-0 items-center justify-end gap-8'>
        <CartPopupTrigger apiProducts={products} />
        <Account logged={session !== null} admin={session?.admin ?? false} />
      </div>
    </header>
  );
}
