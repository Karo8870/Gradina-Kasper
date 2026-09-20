'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  accountNavigationItems,
  logoutNavigationItem
} from '@/components/account/account-navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const LogoutIcon = logoutNavigationItem.icon;

export function AccountSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className='flex min-w-0 flex-col gap-4 border-b pb-6 md:min-h-96 md:border-r md:border-b-0 md:pr-6 md:pb-0'>
      <div className='min-w-0 px-2'>
        <p className='text-sm font-medium'>Contul meu</p>
        <p className='text-muted-foreground truncate text-sm'>{email}</p>
      </div>
      <Separator />
      <nav aria-label='Navigare cont' className='flex flex-col gap-1'>
        {accountNavigationItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;

          return (
            <Button
              aria-current={active ? 'page' : undefined}
              className='w-full justify-start'
              key={href}
              nativeButton={false}
              render={<Link href={href} />}
              variant={active ? 'secondary' : 'ghost'}
            >
              <Icon data-icon='inline-start' />
              {label}
            </Button>
          );
        })}
      </nav>
      <div className='mt-auto pt-2'>
        <Button
          className='w-full justify-start'
          nativeButton={false}
          render={<Link href={logoutNavigationItem.href} />}
          variant='ghost'
        >
          <LogoutIcon data-icon='inline-start' />
          {logoutNavigationItem.label}
        </Button>
      </div>
    </aside>
  );
}
