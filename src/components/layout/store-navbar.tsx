'use client';

import { Menu, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  accountNavigationItems,
  logoutNavigationItem
} from '@/components/account/account-navigation';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { RenderMedia } from '@/components/render-media';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import type { Media } from '@/payload-types';

export type NavbarUser = {
  email: string;
  image?: string | null;
  name: string;
};

export type NavbarContent = {
  image: Media | null;
  links: Array<{
    label: string;
    url: string;
  }>;
};

const LogoutIcon = logoutNavigationItem.icon;

export function StoreNavbar({
  content,
  user
}: {
  content: NavbarContent;
  user: NavbarUser | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 72);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const overHomeHero = pathname === '/' && !scrolled && !mobileOpen;

  return (
    <header
      className={`${pathname === '/' ? 'fixed' : 'sticky'} top-0 z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        overHomeHero
          ? 'bg-transparent text-white'
          : 'bg-background/96 text-primary-950 shadow-[0_1px_0_rgb(226_228_223_/_0.8)] backdrop-blur-md'
      }`}
    >
      <div className='mx-auto flex h-20 w-full max-w-[95rem] items-center gap-4 px-4 sm:px-8'>
        <Link
          className='flex shrink-0 items-center text-lg font-semibold'
          href='/'
        >
          {content.image ? (
            <RenderMedia
              alt={content.image.alt || 'Grădina Kasper'}
              className='h-11 w-auto object-contain'
              src={content.image}
            />
          ) : (
            'Magazin'
          )}
        </Link>
        <nav
          aria-label='Navigare principală'
          className='ml-8 hidden items-center gap-1 md:flex'
        >
          {content.links.map((link) => (
            <Button
              className={
                pathname === link.url
                  ? `relative after:absolute after:right-4 after:bottom-1 after:left-4 after:h-0.5 after:rounded-full ${
                      overHomeHero
                        ? 'text-white after:bg-white'
                        : 'text-primary after:bg-primary'
                    }`
                  : overHomeHero
                    ? 'text-white/90 hover:bg-white/10 hover:text-white'
                    : 'text-primary-950/75 hover:text-primary-900'
              }
              key={`${link.label}-${link.url}`}
              nativeButton={false}
              render={<Link href={link.url} />}
              variant='ghost'
            >
              {link.label}
            </Button>
          ))}
        </nav>
        <div className='ml-auto flex items-center gap-2'>
          <CartDrawer
            triggerClassName={
              overHomeHero
                ? 'text-white hover:bg-white/10 hover:text-white'
                : 'text-primary-950'
            }
          />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label='Deschide meniul contului'
                    className='overflow-hidden rounded-full'
                    size='icon-lg'
                    variant='ghost'
                  />
                }
              >
                {user.image ? (
                  <img
                    alt={user.name}
                    className='size-full object-cover'
                    referrerPolicy='no-referrer'
                    src={user.image}
                  />
                ) : (
                  <UserRound />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-56'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='font-normal'>
                    <span className='block font-medium'>{user.name}</span>
                    <span className='block truncate'>{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountNavigationItems.map(({ href, icon: Icon, label }) => (
                    <DropdownMenuItem key={href} render={<Link href={href} />}>
                      <Icon />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href={logoutNavigationItem.href} />}
                >
                  <LogoutIcon />
                  {logoutNavigationItem.label}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='hidden items-center gap-2 md:flex'>
              <Button
                className={
                  overHomeHero
                    ? 'bg-white/80 text-primary-950 hover:bg-white'
                    : undefined
                }
                nativeButton={false}
                render={<Link href='/login' />}
                variant='ghost'
              >
                Conectare
              </Button>
              <Button
                nativeButton={false}
                render={<Link href='/create-account' />}
              >
                Creează cont
              </Button>
            </div>
          )}

          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger
              render={
                <Button
                  aria-label='Deschide navigarea'
                  className={`md:hidden ${
                    overHomeHero
                      ? 'text-white hover:bg-white/10 hover:text-white'
                      : ''
                  }`}
                  size='icon-lg'
                  variant='ghost'
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent className='w-full sm:max-w-sm'>
              <SheetHeader>
                <SheetTitle>Navigare</SheetTitle>
                <SheetDescription>
                  Accesează paginile magazinului.
                </SheetDescription>
              </SheetHeader>
              <nav
                aria-label='Navigare mobilă'
                className='flex flex-col gap-1 px-4'
              >
                {content.links.map((link) => (
                  <Button
                    className='justify-start'
                    key={`${link.label}-${link.url}`}
                    nativeButton={false}
                    render={<Link href={link.url} />}
                    variant='ghost'
                  >
                    {link.label}
                  </Button>
                ))}
                {user ? (
                  accountNavigationItems.map(({ href, icon: Icon, label }) => (
                    <Button
                      className='justify-start'
                      key={href}
                      nativeButton={false}
                      render={<Link href={href} />}
                      variant='ghost'
                    >
                      <Icon />
                      {label}
                    </Button>
                  ))
                ) : (
                  <>
                    <Button
                      className='mt-4'
                      nativeButton={false}
                      render={<Link href='/login' />}
                      variant='outline'
                    >
                      Conectare
                    </Button>
                    <Button
                      nativeButton={false}
                      render={<Link href='/create-account' />}
                    >
                      Creează cont
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
