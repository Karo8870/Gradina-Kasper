import type { ReactNode } from 'react';

import '../(frontend)/globals.css';

export default function OrderAdminLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='bg-background text-foreground dark min-h-screen'>
        {children}
      </body>
    </html>
  );
}
