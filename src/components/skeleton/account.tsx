'use client';

import { Button } from '@heroui/button';
import Link from 'next/link';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

export default function Account({
  logged,
  admin
}: {
  logged: boolean;
  admin: boolean;
}) {
  const router = useRouter();

  if (admin) {
    return (
      <Dropdown>
        <DropdownTrigger>
          <i className='fa fa-user-circle cursor-pointer text-4xl' />
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem
            startContent={<i className='fa fa-user' />}
            onClick={() => {
              router.push('/admin');
            }}
            key='admin'
          >
            Admin
          </DropdownItem>
          <DropdownItem
            startContent={<i className='fa fa-sign-out' />}
            color='danger'
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            key='logout'
          >
            Deconectare
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  if (logged) {
    return (
      <Dropdown>
        <DropdownTrigger>
          <i className='fa fa-user-circle cursor-pointer text-4xl' />
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem
            startContent={<i className='fa fa-user' />}
            onClick={() => {
              router.push('/profile');
            }}
            key='profile'
          >
            Profil
          </DropdownItem>
          <DropdownItem
            startContent={<i className='fa fa-history' />}
            onClick={() => {
              router.push('/history');
            }}
            key='history'
          >
            Istoric comenzi
          </DropdownItem>
          <DropdownItem
            startContent={<i className='fa fa-sign-out' />}
            color='danger'
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            key='logout'
          >
            Deconectare
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  return (
    <Button as={Link} href='/login' className='bg-zinc-100 text-black/80'>
      Autentificare
    </Button>
  );
}
