import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import '@/lib/fontawesome/css/fa.css';
import { ReactNode } from 'react';
import { Header } from '@/components/skeleton/header';
import { Footer } from '@/components/skeleton/footer';
import { cn } from '@heroui/react';
import ProviderWrapper from '@/lib/providers/provider-wrapper';

const lexend = Lexend({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grădina Kasper',
  description: 'Site Grădina Kasper',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/favicon/icon-light.ico',
        href: '/favicon/icon-light.ico'
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/favicon/icon-dark.ico',
        href: '/favicon/icon-dark.ico'
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          lexend.className,
          'flex min-h-screen flex-col justify-between'
        )}
      >
        <div className='flex flex-col items-center pt-14 sm:pt-20'>
          <ProviderWrapper>
            <Header />
            {children}
          </ProviderWrapper>
        </div>
        <Footer />
      </body>
    </html>
  );
}
