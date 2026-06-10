'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  className?: string;
};

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        'rounded-[2rem] bg-white p-4 shadow-[0_0_35px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5',
        className
      )}
    >
      <ul className='flex flex-col gap-4'>
        <li>
          <Link
            href='/account'
            className={clsx(
              'text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline',
              {
                underline: pathname === '/account',
                'text-primary-900': pathname === '/account'
              }
            )}
          >
            Setări cont
          </Link>
        </li>

        <li>
          <Link
            href='/account/addresses'
            className={clsx(
              'text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline',
              {
                underline: pathname === '/account/addresses',
                'text-primary-900': pathname === '/account/addresses'
              }
            )}
          >
            Adrese
          </Link>
        </li>

        <li>
          <Link
            href='/orders'
            className={clsx(
              'text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline',
              {
                underline: pathname === '/orders' || pathname.includes('/orders'),
                'text-primary-900':
                  pathname === '/orders' || pathname.includes('/orders')
              }
            )}
          >
            Comenzi
          </Link>
        </li>

        <li>
          <Link
            href='/logout'
            className={clsx(
              'text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline',
              {
                underline: pathname === '/logout',
                'text-primary-900': pathname === '/logout'
              }
            )}
          >
            Deconectare
          </Link>
        </li>
      </ul>
    </nav>
  );
};
