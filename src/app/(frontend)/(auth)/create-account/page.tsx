import { redirect } from 'next/navigation';

import { CreateAccountForm } from '@/components/forms/auth/create-account-form';
import { AuthFeedback } from '@/components/auth/auth-feedback';
import { AuthPage } from '@/components/auth/auth-page';
import { getCurrentUser } from '@/lib/auth/current-user';
import { withFeedback } from '@/lib/auth/utils';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CreateAccountPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (user) {
    redirect(withFeedback('/account', 'warning', 'Ești deja autentificat.'));
  }

  return (
    <AuthPage description='Creează un cont nou.' title='Creează cont'>
      <AuthFeedback searchParams={params} />
      <CreateAccountForm />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Creează cont',
  'Creează un cont de client.',
  '/create-account',
  { noIndex: true }
);
