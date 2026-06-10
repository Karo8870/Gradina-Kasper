import type { Metadata } from 'next';

import { RenderParams } from '@/components/RenderParams';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import React from 'react';
import { headers as getHeaders } from 'next/headers';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { CreateAccountForm } from '@/components/forms/CreateAccountForm';
import { redirect } from 'next/navigation';

export default async function CreateAccount() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  if (user) {
    redirect(
      `/account?warning=${encodeURIComponent('Sunteți deja autentificat.')}`
    );
  }

  return (
    <div className='container pt-32'>
      <div className='mx-auto w-full max-w-4xl rounded-[2rem] bg-white p-6 shadow-[0_0_35px_8px_rgba(0,0,0,0.08)] md:p-10'>
        <RenderParams className='mb-2' />
        <CreateAccountForm />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  description: 'Creați un cont sau autentificați-vă într-un cont existent',
  openGraph: mergeOpenGraph({
    title: 'Creați un cont',
    url: '/account'
  }),
  title: 'Cont'
};
