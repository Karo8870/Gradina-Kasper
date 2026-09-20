import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TwoFactorChallengeForm } from '@/components/forms/auth/two-factor-challenge-form';
import { AuthPage } from '@/components/auth/auth-page';
import { getCurrentUser } from '@/lib/auth/current-user';
import { withFeedback } from '@/lib/auth/utils';
import { staticMetadata } from '@/lib/static-metadata';
import { twoFactorMode } from '@/lib/auth/two-factor/config';

export default async function TwoFactorPage() {
  if (twoFactorMode === 'none') {
    redirect('/login');
  }

  const [cookieStore, user] = await Promise.all([cookies(), getCurrentUser()]);

  if (user) {
    redirect(withFeedback('/account', 'warning', 'Ești deja autentificat.'));
  }

  const hasChallenge =
    cookieStore.has('better-auth.two_factor') ||
    cookieStore.has('__Secure-better-auth.two_factor');

  if (!hasChallenge) {
    redirect(
      withFeedback(
        '/login',
        'warning',
        'Sesiunea de verificare a expirat. Autentifică-te din nou.'
      )
    );
  }

  return (
    <AuthPage
      description={
        twoFactorMode === 'otp'
          ? 'Introdu codul trimis la adresa de email a contului.'
          : 'Introdu codul generat de aplicația ta de autentificare.'
      }
      title='Verificare în doi pași'
    >
      <TwoFactorChallengeForm mode={twoFactorMode} />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Verificare în doi pași',
  'Finalizează autentificarea în cont.',
  '/two-factor',
  { noIndex: true }
);
