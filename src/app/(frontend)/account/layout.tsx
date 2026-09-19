import type { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { getCurrentUser } from '@/features/auth/current-user';
import { withFeedback } from '@/features/auth/utils';

export default async function AccountLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      withFeedback(
        '/login',
        'warning',
        'Autentifică-te pentru a-ți accesa contul.',
        { redirect: '/account' }
      )
    );
  }

  return (
    <div className='mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 md:grid-cols-[14rem_minmax(0,1fr)]'>
      <AccountSidebar email={user.email} />
      <section className='min-w-0'>{children}</section>
    </div>
  );
}
