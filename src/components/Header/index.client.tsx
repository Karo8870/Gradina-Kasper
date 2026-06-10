'use client';

import { useAuth } from '@/providers/Auth';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import RenderImage from '@/components/RenderImage';
import { Cart } from '@/components/Cart';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/payload-types';
import { cn } from '@/utilities/cn';

export default function ({ header }: { header: Header }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const profileLinks = useMemo(() => {
    return [
      { href: '/account', label: 'Setări cont' },
      { href: '/account/addresses', label: 'Adrese' },
      { href: '/orders', label: 'Comenzi' },
      { href: '/logout', label: 'Deconectare' }
    ];
  }, [user]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        event.target instanceof Node &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(window.scrollY);
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/' && scrollProgress <= 100;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 z-40 w-full transition-all flex flex-col',
        isHome && !open ? 'bg-transparent backdrop-blur-sm' : 'bg-white',
        open ? 'h-[100dvh]' : 'h-20'
      )}
    >
      <div className='mx-auto flex w-full max-w-[86rem] items-center gap-3 px-4 py-3 md:px-6'>
        <Link href='/' className='shrink-0'>
          <RenderImage
            className='h-12 w-auto object-contain md:h-14'
            src={header.headerImage}
          />
        </Link>

        <nav className='ml-auto hidden lg:block'>
          <ul className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
            {header.links.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.url}
                  className={cn(
                    'hover:underline decoration-2 inline-flex rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isHome
                      ? 'text-white'
                      : 'text-primary-800 hover:text-primary-900'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className='ml-auto flex items-center gap-4 lg:ml-3'>
          <Cart />

          {user ? (
            <div className='relative hidden lg:block' ref={profileMenuRef}>
              <button
                type='button'
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className='bg-secondary-100 aspect-square text-primary-900 hover:bg-secondary-200 inline-flex items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors'
              >
                <UserRound strokeWidth={3} className='size-4' />
              </button>

              {isProfileOpen && (
                <div className='absolute top-[calc(100%+0.5rem)] right-0 min-w-52 rounded-2xl bg-white p-2 shadow-lg'>
                  <ul className='flex flex-col gap-1'>
                    {profileLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className='text-primary-900 hover:bg-secondary-100 inline-flex w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors'
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className='items-center gap-2 hidden lg:flex'>
              <Button
                asChild
                variant='outline'
                className='bg-secondary-100 text-primary-900 hover:bg-secondary-200 h-11 rounded-full border-0 px-4 text-sm font-semibold'
              >
                <Link href='/login'>Conectare</Link>
              </Button>

              <Button
                asChild
                className='bg-primary-900 hover:bg-primary-800 h-11 rounded-full px-4 text-sm font-semibold text-white'
              >
                <Link href='/create-account'>Creează cont</Link>
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label='Toggle menu'
          className='relative flex h-12 w-12 items-center justify-center lg:hidden'
        >
          <span
            className={cn(
              'absolute h-1 w-7 bg-current transition-all duration-300 rounded-full',
              open ? 'rotate-45' : '-translate-y-2',
              isHome && !open
                ? 'bg-white'
                : 'bg-primary-800 hover:bg-primary-900'
            )}
          />

          <span
            className={cn(
              'absolute h-1 w-7 bg-current transition-all duration-300 rounded-full',
              open ? 'opacity-0' : 'opacity-100',
              isHome && !open
                ? 'bg-white'
                : 'bg-primary-800 hover:bg-primary-900'
            )}
          />

          <span
            className={cn(
              'absolute h-1 w-7 bg-current transition-all duration-300 rounded-full',
              open ? '-rotate-45' : 'translate-y-2',
              isHome && !open
                ? 'bg-white'
                : 'bg-primary-800 hover:bg-primary-900'
            )}
          />
        </button>
      </div>
      <div
        className={cn(
          'flex-col grow basis-0 items-center justify-center',
          open ? 'flex' : 'hidden'
        )}
      >
        <nav className='pb-[72px]'>
          <ul className='flex flex-col items-center'>
            {header.links.map((link, index) => (
              <li key={index}>
                <Link
                  onClick={() => setOpen(false)}
                  href={link.url}
                  className={cn(
                    'hover:underline decoration-2 inline-flex rounded-full px-3 py-2 text-base font-semibold transition-colors',
                    'text-primary-800 hover:text-primary-900'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className='mt-10 flex flex-col items-center gap-3'>
            {user ? (
              <Button
                asChild
                className='bg-secondary-100 text-primary-900 hover:bg-secondary-200 h-11 rounded-full border-0 px-4 text-sm font-semibold shadow-none'
              >
                <Link
                  onClick={() => setOpen(false)}
                  href='/account'
                  className='inline-flex items-center gap-2'
                >
                  <UserRound strokeWidth={3} className='size-4' />
                  Cont
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant='outline'
                  className='bg-secondary-100 text-primary-900 hover:bg-secondary-200 h-11 rounded-full border-0 px-4 text-sm font-semibold'
                >
                  <Link onClick={() => setOpen(false)} href='/login'>
                    Conectare
                  </Link>
                </Button>

                <Button
                  asChild
                  className='bg-primary-900 hover:bg-primary-800 h-11 rounded-full px-4 text-sm font-semibold text-white'
                >
                  <Link onClick={() => setOpen(false)} href='/create-account'>
                    Creează cont
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
