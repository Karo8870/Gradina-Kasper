'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Clock3,
  LogIn,
  LogOut,
  Menu,
  Repeat2,
  ShoppingBasket,
  UserPlus,
  UserRound,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type HeaderLink = {
  label: string;
  url: string;
};

const accountMenuItems: Array<{
  label: string;
  href: string;
  icon: typeof UserRound;
  destructive?: boolean;
}> = [
  {
    label: 'Profil',
    href: '/profile',
    icon: UserRound
  },
  {
    label: 'Istoric comenzi',
    href: '/history',
    icon: Clock3
  },
  {
    label: 'Abonamente',
    href: '/subscriptions',
    icon: Repeat2
  },
  {
    label: 'Autentificare',
    href: '/login',
    icon: LogIn
  },
  {
    label: 'Înregistrare',
    href: '/register',
    icon: UserPlus
  },
  {
    label: 'Deconectare',
    href: '/login',
    icon: LogOut,
    destructive: true
  }
];

function isCurrentPath(pathname: string, href: string) {
  if (!href.startsWith('/')) {
    return false;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavigation({ links }: { links: HeaderLink[] }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (!event.target.closest('[data-account-menu-root]')) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, []);

  return (
    <div className='relative ml-auto flex items-center gap-2'>
      <nav className='hidden items-center gap-1 md:flex'>
        {links.map((link) => {
          const active = isCurrentPath(pathname, link.url);

          return (
            <Link
              key={`${link.url}-${link.label}`}
              href={link.url}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-colors',
                active
                  ? 'bg-primary-900 text-white'
                  : 'text-primary-900 hover:bg-secondary-100'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className='hidden items-center gap-2 md:flex'>
        <Button
          asChild
          variant='outline'
          className='h-10 rounded-full border-primary-200 bg-white px-4 text-primary-900 hover:bg-secondary-100'
        >
          <Link href='/products' aria-label='Coș de cumpărături'>
            <ShoppingBasket className='size-4' />
            <span>Coș</span>
          </Link>
        </Button>

        <div className='relative' data-account-menu-root>
          <Button
            className='h-10 rounded-full bg-primary-900 px-4 text-white hover:bg-primary-800'
            aria-label='Cont'
            aria-haspopup='menu'
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((open) => !open)}
          >
            <UserRound className='size-4' />
            <span>Cont</span>
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                isAccountMenuOpen && 'rotate-180'
              )}
            />
          </Button>

          <div
            className={cn(
              'absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 overflow-hidden rounded-2xl border border-primary-100 bg-white p-1 shadow-lg transition-all duration-200',
              isAccountMenuOpen
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0'
            )}
          >
            {accountMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsAccountMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    item.destructive
                      ? 'text-red-700 hover:bg-red-50'
                      : 'text-primary-900 hover:bg-secondary-100'
                  )}
                >
                  <Icon className='size-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        size='icon'
        variant='outline'
        className='rounded-full border-primary-200 text-primary-900 md:hidden'
        aria-label={isMenuOpen ? 'Închide meniul' : 'Deschide meniul'}
        aria-expanded={isMenuOpen}
        aria-controls='mobile-header-menu'
        onClick={() => {
          setIsMenuOpen((open) => !open);
          setIsAccountMenuOpen(false);
        }}
      >
        {isMenuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
      </Button>

      <div
        id='mobile-header-menu'
        className={cn(
          'absolute top-[calc(100%+0.6rem)] right-0 left-0 z-50 overflow-hidden rounded-3xl border border-primary-100 bg-white/95 p-3 shadow-lg backdrop-blur transition-all duration-200 md:hidden',
          isMenuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <nav className='flex flex-col gap-1'>
          {links.map((link) => {
            const active = isCurrentPath(pathname, link.url);

            return (
              <Link
                key={`mobile-${link.url}-${link.label}`}
                href={link.url}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary-900 text-white'
                    : 'text-primary-900 hover:bg-secondary-100'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className='mt-3 grid grid-cols-2 gap-2'>
          <Button
            asChild
            variant='outline'
            className='h-10 rounded-2xl border-primary-200 bg-white text-primary-900 hover:bg-secondary-100'
          >
            <Link href='/products' onClick={() => setIsMenuOpen(false)} aria-label='Coș de cumpărături'>
              <ShoppingBasket className='size-4' />
              <span>Coș</span>
            </Link>
          </Button>

          <div className='relative' data-account-menu-root>
            <Button
              className='h-10 w-full rounded-2xl bg-primary-900 text-white hover:bg-primary-800'
              aria-label='Cont'
              aria-haspopup='menu'
              aria-expanded={isAccountMenuOpen}
              onClick={() => setIsAccountMenuOpen((open) => !open)}
            >
              <UserRound className='size-4' />
              <span>Cont</span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  isAccountMenuOpen && 'rotate-180'
                )}
              />
            </Button>

            <div
              className={cn(
                'absolute top-[calc(100%+0.4rem)] right-0 left-0 z-50 overflow-hidden rounded-2xl border border-primary-100 bg-white p-1 shadow-lg transition-all duration-200',
                isAccountMenuOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-2 opacity-0'
              )}
            >
              {accountMenuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={`mobile-${item.label}`}
                    href={item.href}
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      item.destructive
                        ? 'text-red-700 hover:bg-red-50'
                        : 'text-primary-900 hover:bg-secondary-100'
                    )}
                  >
                    <Icon className='size-4' />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}