'use client';

import { UserRound } from 'lucide-react';
import Link from 'next/link';

import {
  accountNavigationItems,
  logoutNavigationItem
} from '@/components/account/account-navigation';
import { CartDrawer } from '@/components/cart/cart-drawer';
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

export type NavbarUser = {
  email: string;
  image?: string | null;
  name: string;
};

const LogoutIcon = logoutNavigationItem.icon;

export function StoreNavbar({ user }: { user: NavbarUser | null }) {
  return (
    <header className='bg-background/95 sticky top-0 z-40 border-b backdrop-blur'>
      <div className='mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6'>
        <Link className='text-lg font-semibold' href='/'>
          Magazin
        </Link>
        <nav aria-label='Navigare principală' className='ml-4'>
          <Button
            nativeButton={false}
            render={<Link href='/products' />}
            variant='ghost'
          >
            Produse
          </Button>
        </nav>
        <div className='ml-auto flex items-center gap-1'>
          <CartDrawer />
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
            <Button
              aria-label='Autentificare'
              nativeButton={false}
              render={<Link href='/login' />}
              size='icon-lg'
              variant='ghost'
            >
              <UserRound />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
