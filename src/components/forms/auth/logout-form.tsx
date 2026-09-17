'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { logoutAction } from '@/actions/auth';
import { FormStatus } from '@/components/form-components';
import { withFeedback } from '@/features/auth/utils';

export function LogoutForm() {
  const didStart = useRef(false);
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    void logoutAction()
      .then((result) => {
        if (!result.success) {
          setError(true);
          return;
        }

        router.replace(withFeedback('/login', 'success', 'Te-ai deconectat.'));
        router.refresh();
      })
      .catch(() => setError(true));
  }, [router]);

  return error ? (
    <FormStatus kind='error'>Nu am putut închide sesiunea.</FormStatus>
  ) : (
    <FormStatus kind='message'>Se închide sesiunea...</FormStatus>
  );
}
