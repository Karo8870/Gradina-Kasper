import type { ReactNode } from 'react';

import { headers as getHeaders } from 'next/headers.js';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { RenderParams } from '@/components/RenderParams';
import { AccountNav } from '@/components/AccountNav';

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  return (
    <div className='pt-28'>
      <div className='container'>
        <RenderParams className='' />
      </div>

      <div className='container mt-10 flex gap-8 pb-10'>
        {user && (
          <AccountNav className='hidden w-full max-w-72 shrink-0 self-start md:block' />
        )}

        <div className='flex flex-col gap-12 grow'>{children}</div>
      </div>
    </div>
  );
}
