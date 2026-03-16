import Link from 'next/link';

export async function Header() {
  return (
    <header className='fixed top-0 left-0 z-[100] flex w-screen bg-white px-4 py-3 md:px-24'>
      <div className='hidden grow basis-0 md:block' />
      <Link
        href='/public'
        className='flex grow cursor-pointer items-center justify-start gap-2 md:justify-center'
      >
        <img className='w-8 md:w-14' src='/logo.svg' alt='logo' />
        <h1 className='text-primary-950 text-base font-bold md:text-3xl'>
          Grădina Kasper
        </h1>
      </Link>
      <div className='flex grow basis-0 items-center justify-end gap-8'>
        <CartPopupTrigger apiProducts={products} />
        {/*<Account logged={session !== null} admin={session?.admin ?? false} />*/}
      </div>
    </header>
  );
}