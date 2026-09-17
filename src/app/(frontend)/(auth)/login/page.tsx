import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/forms/auth/login-form';
import { AuthFeedback } from '@/features/auth/auth-feedback';
import { AuthPage } from '@/features/auth/auth-page';
import { getCurrentUser } from '@/features/auth/current-user';
import { withFeedback } from '@/features/auth/utils';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (user) {
    redirect(withFeedback('/account', 'warning', 'Ești deja autentificat.'));
  }

  return (
    <AuthPage
      description='Autentifică-te pentru a continua.'
      title='Autentificare'
    >
      <AuthFeedback searchParams={params} />
      <LoginForm />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Autentificare',
  'Autentifică-te în contul tău.',
  '/login',
  { noIndex: true }
);
