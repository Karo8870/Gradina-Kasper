import type { Metadata } from 'next';

import { AccountPageShell } from '@/components/account/AccountPageShell';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import { headers as getHeaders } from 'next/headers.js';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import { AddressListing } from '@/components/addresses/AddressListing';
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal';

export default async function AddressesPage() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Trebuie să fii autentificat pentru a-ți vedea setările contului.')}`
    );
  }

  return (
    <AccountPageShell title='Adrese' action={<CreateAddressModal />}>
      <div className='rounded-[1.5rem] bg-secondary-100 p-5 md:p-6'>
        <AddressListing />
      </div>
    </AccountPageShell>
  );
}

export const metadata: Metadata = {
  description: 'Gestionează adresele tale.',
  openGraph: mergeOpenGraph({
    title: 'Adrese',
    url: '/account/addresses'
  }),
  title: 'Adrese'
};
