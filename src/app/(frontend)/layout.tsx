import React from 'react';
import { Footer } from '@/components/layout/footer';
import '../../globals.css';
import { Lexend } from 'next/font/google';
import { Header } from '@/components/layout/header';

export const metadata = {
  description: 'Grădina Kasper',
  title: 'Grădina Kasper'
};

const lexend = Lexend({
  subsets: ['latin']
});

export const dynamic = 'force-dynamic';

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang='en' className={lexend.className}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
