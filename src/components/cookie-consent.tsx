'use client';

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider
} from '@c15t/nextjs';
import type { ReactNode } from 'react';

export function CookieConsent({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        scripts: []
      }}
    >
      {children}
      <ConsentBanner />
      <ConsentDialog />
    </ConsentManagerProvider>
  );
}
