import { cn } from '@heroui/react';
import { ReactNode } from 'react';

export default function InfoCard({
  className,
  children
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div className='flex items-center gap-3 rounded-2xl bg-zinc-100 p-5'>
      <i className={cn(className, 'text-2xl text-black/70')} />
      <label className='text-[0.875rem] font-medium text-black/90 sm:text-base'>
        {children}
      </label>
    </div>
  );
}
