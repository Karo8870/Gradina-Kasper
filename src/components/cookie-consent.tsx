'use client';

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
  useConsentManager
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

export function CookieSettingsLink({ label }: { label: string }) {
  const { setActiveUI } = useConsentManager();

  return (
    <button
      className='text-center text-sm text-white/90 md:text-base'
      onClick={() => setActiveUI('dialog')}
      type='button'
    >
      {label}
    </button>
  );
}
