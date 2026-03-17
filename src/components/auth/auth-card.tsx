import Link from 'next/link';
import { ArrowRight, UserRound } from 'lucide-react';

type AuthCardProps = {
  text1: string;
  text2: string;
  href: string;
};

export default function AuthCard({ text1, text2, href }: AuthCardProps) {
  return (
    <Link
      href={href}
      className='bg-secondary-50 hover:bg-secondary-100 border-border flex items-center justify-between rounded-2xl border p-4 transition-colors'
    >
      <div className='flex items-center gap-3'>
        <div className='bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full'>
          <UserRound className='h-5 w-5 text-primary-900' />
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-primary-900'>{text1}</span>
          <span className='text-sm text-primary-700'>{text2}</span>
        </div>
      </div>

      <ArrowRight className='h-4 w-4 text-primary-800' />
    </Link>
  );
}