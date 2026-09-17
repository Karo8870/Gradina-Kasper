import { redirect } from 'next/navigation';

import { getSearchParam, withFeedback } from '@/features/auth/utils';
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

  try {
    const payload = await getCMS();
    const verified = await payload.verifyEmail({ collection: 'users', token });

    if (verified) {
      redirect(
        withFeedback(
          '/login',
          'success',
          'Emailul a fost verificat. Te poți autentifica.'
        )
      );
    }
  } catch {
    // The login route gives a generic invalid-token response.
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
