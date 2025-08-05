import { cn } from '@heroui/react';
import { Button } from '@heroui/button';
import Link from 'next/link';

export default function AuthCard({
  text1,
  text2,
  iconClassname,
  href
}: {
  text1: string;
  text2: string;
  iconClassname: string;
  href: string;
}) {
  return (
    <Button
      as={Link}
      href={href}
      className='flex h-auto items-center justify-between rounded-[1.25rem] bg-secondary-100 px-5 py-4'
    >
      <div className='flex gap-3'>
        <div className='flex aspect-square items-center justify-center rounded-full bg-secondary-50 p-3'>
          <i className={cn('fa text-xl text-primary-900', iconClassname)} />
        </div>
        <div className='flex flex-col items-start justify-center'>
          <p className='text-sm font-medium leading-tight text-black/80'>
            {text1}
          </p>
          <p className='text-sm font-medium leading-tight text-black/80'>
            {text2}
          </p>
        </div>
      </div>
      <i className='fa fa-arrow-right text-xl text-primary-900' />
    </Button>
  );
}
