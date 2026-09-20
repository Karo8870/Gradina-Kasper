import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/components/forms/auth/reset-password-form';
import { AuthFeedback } from '@/components/auth/auth-feedback';
import { AuthPage } from '@/components/auth/auth-page';
import { getSearchParam, withFeedback } from '@/lib/auth/utils';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ConfirmPasswordResetPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = getSearchParam(params, 'token');

  if (!token) {
    redirect(
      withFeedback('/login', 'error', 'Linkul de resetare este invalid.')
    );
  }

  return (
    <AuthPage
      description='Alege o parolă nouă pentru contul tău.'
      title='Resetează parola'
    >
      <AuthFeedback searchParams={params} />
      <ResetPasswordForm token={token} />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Resetează parola',
  'Alege o parolă nouă pentru contul tău.',
  '/confirm-password-reset',
  { noIndex: true }
);
