import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className='container flex min-h-[75vh] items-center justify-center py-12 md:py-16'>
      <div className='mx-auto max-w-2xl text-center'>
        <h1 className='text-primary-900 mb-5 text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'>
          Pagina nu a putut fi găsită
        </h1>
        <p className='mx-auto mb-10 max-w-xl text-lg leading-relaxed text-neutral-700 md:text-xl'>
          Linkul pe care l-ai accesat nu există sau a fost mutat.
        </p>
        <Button
          asChild
          variant='default'
          className='h-12 rounded-full px-7 text-base font-semibold bg-primary-900'
        >
          <Link href='/'>Înapoi acasă</Link>
        </Button>
      </div>
    </main>
  );
}
