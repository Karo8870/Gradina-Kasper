import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';

type AuthSwitchCardProps = {
  href: string;
  icon: React.ReactNode;
  text: React.ReactNode;
};

export const AuthSwitchCard: React.FC<AuthSwitchCardProps> = ({
  href,
  icon,
  text
}) => {
  return (
    <Link
      href={href}
      className='bg-secondary-100 mt-6 flex items-center justify-between rounded-[20px] px-5 py-4'
    >
      <span className='flex items-center gap-3'>
        <span className='bg-secondary-50 text-primary-900 flex size-11 items-center justify-center rounded-full'>
          {icon}
        </span>
        <span className='text-sm leading-tight font-medium text-neutral-800 md:text-base'>
          {text}
        </span>
      </span>

      <ArrowRight strokeWidth={3} className='size-7 text-neutral-700' />
    </Link>
  );
};
