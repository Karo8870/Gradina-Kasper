import { Basket } from '@/components/basket/basket';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { getVisibleProducts } from '@/lib/api/products';
import { ContinueButton } from '@/components/buttons/continue-button';

export default async function Page() {
  const products = await getVisibleProducts();

  return (
    <main className='flex w-full max-w-[45rem] flex-col items-stretch gap-8 px-6'>
      <div className='flex items-center gap-4 pt-8 sm:gap-0'>
        <div className='sm:grow sm:basis-0'>
          <Button
            as={Link}
            href='/'
            isIconOnly
            className='rounded-full bg-zinc-100'
          >
            <i className='fa fa-chevron-left text-base text-black' />
          </Button>
        </div>
        <h1 className='text-center text-2xl font-bold text-black sm:grow sm:text-4xl sm:text-black/80'>
          Coș de cumpărături
        </h1>
        <div className='hidden grow basis-0 sm:block' />
      </div>
      <Basket apiProducts={products} editable>
        <ContinueButton href='/checkout/details' />
      </Basket>
    </main>
  );
}
