import { AuthProvider } from '@/providers/Auth';
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react';
import React from 'react';

import { HeaderThemeProvider } from './HeaderTheme';
import { ThemeProvider } from './Theme';
import { SonnerProvider } from '@/providers/Sonner';
import { clientSideNetopiaPaymentAdapter } from '@/payment/netopia/clientSideNetopiaPaymentAdapter';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            currenciesConfig={{
              defaultCurrency: 'RON',
              supportedCurrencies: [
                {
                  code: 'RON',
                  decimals: 2,
                  label: 'LEU Românesc',
                  symbol: 'RON',
                  symbolDisplay: 'code'
                }
              ]
            }}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    hasDiscount: true,
                    discountedPrice: true,
                    meta: true,
                    price: true,
                    slug: true,
                    name: true,
                    gallery: true,
                    inventory: true
                  }
                }
              }
            }}
            paymentMethods={[clientSideNetopiaPaymentAdapter]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
