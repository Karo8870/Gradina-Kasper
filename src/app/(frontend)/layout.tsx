import React from 'react';
import { CookieConsent } from '@/components/cookie-consent';
import { EcommerceProvider } from '@/components/commerce/ecommerce-provider';
import { StoreNavbar } from '@/components/layout/store-navbar';
import { getCurrentUser } from '@/lib/auth/current-user';

import './globals.css';

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template'
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  const user = await getCurrentUser();

  return (
    <html lang='en'>
      <body className='dark'>
        <CookieConsent>
          <EcommerceProvider>
            <StoreNavbar
              user={
                user
                  ? {
                      email: user.email,
                      image: user.image,
                      name: user.name
                    }
                  : null
              }
            />
            <main>{children}</main>
          </EcommerceProvider>
        </CookieConsent>
      </body>
    </html>
  );
}
