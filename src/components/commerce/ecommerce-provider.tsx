'use client';

import { EcommerceProvider as PayloadEcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react';
import type { ReactNode } from 'react';

import { commerceCurrencies, storeCurrency } from '@/commerce/currencies';
import { netopiaPaymentAdapterClient } from '@/payments/netopia/client-adapter';

const priceField = `priceIn${storeCurrency.code.toUpperCase()}`;

export function EcommerceProvider({ children }: { children: ReactNode }) {
  return (
    <PayloadEcommerceProvider
      api={{
        cartsFetchQuery: {
          depth: 2,
          populate: {
            products: {
              availability: true,
              disabled: true,
              gallery: true,
              inventory: true,
              name: true,
              [priceField]: true,
              slug: true
            }
          }
        }
      }}
      currenciesConfig={commerceCurrencies}
      paymentMethods={[netopiaPaymentAdapterClient]}
    >
      {children}
    </PayloadEcommerceProvider>
  );
}
