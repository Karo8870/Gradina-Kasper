import { redirect } from 'next/navigation';

import { getSearchParam, withFeedback } from '@/features/auth/utils';
import { getBetterAuth } from '@/lib/auth/server';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const token = getSearchParam(await searchParams, 'token');

  if (!token) {
    redirect(
      withFeedback('/login', 'error', 'Linkul de verificare este invalid.')
    );
  }

  let verified = false;

  try {
    const payload = await getCMS();
    const auth = getBetterAuth(payload);
    const result = await auth.api.verifyEmail({ query: { token } });
    verified = result?.status ?? false;
  } catch {
    // The login route gives a generic invalid-token response.
  }

  if (verified) {
    redirect(
      withFeedback(
        '/login',
        'success',
        'Emailul a fost verificat. Te poți autentifica.'
      )
    );
  }

  redirect(
    withFeedback('/login', 'error', 'Linkul de verificare este invalid.')
  );
}

export const metadata = staticMetadata(
  'Verifică emailul',
  'Confirmarea adresei de email.',
  '/verify-email',
  { noIndex: true }
);
