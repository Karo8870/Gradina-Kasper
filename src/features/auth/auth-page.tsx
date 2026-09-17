import type { ReactNode } from 'react';

export function AuthPage({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </header>
      {children}
    </div>
  );
}
