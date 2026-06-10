import type { Metadata } from 'next';

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import React from 'react';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export default async function Checkout() {
  const payload = await getPayload({ config: configPromise });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const holidayDates = await payload.find({
    collection: 'holiday-dates',
    where: {
      date: {
        greater_than_equal: today.toISOString()
      }
    }
  });

  const checkoutSettings = await payload.findGlobal({
    slug: 'checkout-settings'
  });

  return (
    <div className='container min-h-[90vh] flex pt-24'>
      <h1 className='sr-only'>Checkout</h1>

      <CheckoutPage
        checkoutSettings={checkoutSettings}
        holidayDates={holidayDates.docs.map((el) => el.date)}
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
