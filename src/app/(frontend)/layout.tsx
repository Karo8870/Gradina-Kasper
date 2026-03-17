import React from 'react';
import { Footer } from '@/components/layout/footer';
import '../../globals.css';
import { Lexend } from 'next/font/google';
import { Header } from '@/components/layout/header';

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template'
};

const lexend = Lexend({
  subsets: ['latin']
});

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
