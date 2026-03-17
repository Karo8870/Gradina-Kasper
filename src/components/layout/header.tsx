import Link from 'next/link';
import { HeaderNavigation } from '@/components/layout/header-navigation';
import { payload } from '@/lib/payload';

export async function Header() {
  const header = await payload.findGlobal({
    slug: 'header'
  });

  const links = (header.links ?? [])
    .map((link) => ({
      label: link?.label?.trim() ?? '',
      url: link?.url?.trim() ?? ''
    }))
    .filter(
      (link): link is { label: string; url: string } =>
        link.label.length > 0 && link.url.length > 0
    );

  return (
    <header className='sticky top-0 z-40 w-full border-b border-primary-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
      <div className='mx-auto flex w-full max-w-[86rem] items-center gap-3 px-4 py-3 md:px-6'>
        <Link href='/' className='group flex items-center gap-3'>
          <div className='bg-secondary-100 ring-primary-200/80 flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-offset-1 transition-colors group-hover:bg-secondary-200'>
            <img className='h-6 w-6' src='/logo.svg' alt='logo' />
          </div>
          <div className='flex flex-col leading-none'>
            <span className='text-[0.65rem] font-semibold tracking-[0.18em] text-primary-700 uppercase'>
              Ferma locală
            </span>
            <h1 className='text-primary-950 text-lg font-extrabold tracking-tight sm:text-2xl'>
              Grădina Kasper
            </h1>
          </div>
        </Link>

        <HeaderNavigation links={links} />
      </div>
    </header>
  );
}
