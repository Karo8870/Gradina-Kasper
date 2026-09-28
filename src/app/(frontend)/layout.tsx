import React from 'react';
import { Lexend } from 'next/font/google';

import { CookieConsent } from '@/components/cookie-consent';
import { EcommerceProvider } from '@/components/commerce/ecommerce-provider';
import { StoreFooter } from '@/components/layout/store-footer';
import { StoreNavbar } from '@/components/layout/store-navbar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';
import type { Media } from '@/payload-types';

import './globals.css';

const lexend = Lexend({
  subsets: ['latin']
});

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template'
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  const payload = await getCMS();
  const [user, header, footer] = await Promise.all([
    getCurrentUser(),
    payload.findGlobal({
      slug: 'header',
      depth: 1,
      overrideAccess: false
    }),
    payload.findGlobal({
      slug: 'footer',
      depth: 1,
      overrideAccess: false
    })
  ]);
  const headerImage =
    typeof header.headerImage === 'object'
      ? (header.headerImage as Media)
      : null;
  const headerLinks = header.links?.length
    ? header.links
    : [{ label: 'Produse', url: '/products' }];

  return (
    <html lang='ro'>
      <body className={`${lexend.className} flex min-h-screen flex-col`}>
        <CookieConsent>
          <EcommerceProvider>
            <StoreNavbar
              content={{
                image: headerImage,
                links: headerLinks.map(({ label, url }) => ({
                  label,
                  url
                }))
              }}
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
            <main className='flex-1'>{children}</main>
            <StoreFooter footer={footer} />
          </EcommerceProvider>
        </CookieConsent>
      </body>
    </html>
  );
}
