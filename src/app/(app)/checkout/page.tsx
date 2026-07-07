import type { Metadata } from 'next';

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import React from 'react';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export default async function Checkout() {
  const payload = await getPayload({ config: configPromise });

  const [checkoutSettings, deliveryPickupConfig] = await Promise.all([
    payload.findGlobal({
      slug: 'checkout-settings'
    }),
    payload.findGlobal({
      slug: 'delivery-pickup-configuration' as any,
      depth: 0
    })
  ]);

  return (
    <div className='container min-h-[90vh] flex pt-24'>
      <h1 className='sr-only'>Checkout</h1>

      <CheckoutPage
        checkoutSettings={checkoutSettings}
        deliveryPickupConfig={deliveryPickupConfig}
      />
    </div>
  );
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout'
  }),
  title: 'Checkout'
};
