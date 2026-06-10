import type { Metadata } from 'next';

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import React, { Suspense } from 'react';
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder';

export default async function ConfirmOrderPage() {
  return (
    <div className='container min-h-[90vh] flex py-12'>
      <Suspense>
        <ConfirmOrder />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  description: 'Confirmare comandă.',
  openGraph: mergeOpenGraph({
    title: 'Se confirmă comanda...',
    url: '/checkout/confirm-order'
  }),
  title: 'Se confirmă comanda...'
};
