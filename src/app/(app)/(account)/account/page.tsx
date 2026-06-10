import type { Metadata } from 'next';

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import { headers as getHeaders } from 'next/headers.js';
import configPromise from '@payload-config';
import { AccountPageShell } from '@/components/account/AccountPageShell';
import { AccountForm } from '@/components/forms/AccountForm';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Trebuie să fii autentificat pentru a vedea setările contului.')}`
    );
  }

  return (
    <div className='grid gap-8'>
      <AccountPageShell title='Setări cont'>
        <AccountForm />
      </AccountPageShell>
    </div>
  );
}

export const metadata: Metadata = {
  description: 'Creează un cont sau autentifică-te în contul existent.',
  openGraph: mergeOpenGraph({
    title: 'Cont',
    url: '/account'
  }),
  title: 'Cont'
};
