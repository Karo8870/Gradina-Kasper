import { ForgotPasswordForm } from '@/components/forms/auth/forgot-password-form';
import { AuthFeedback } from '@/components/auth/auth-feedback';
import { AuthPage } from '@/components/auth/auth-page';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <AuthPage
      description='Introdu adresa de email asociată contului pentru a primi un link de recuperare a parolei'
      title='Ai uitat parola?'
    >
      <AuthFeedback searchParams={params} />
      <ForgotPasswordForm />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Resetează parola',
  'Solicită instrucțiuni pentru resetarea parolei.',
  '/forgot-password',
  { noIndex: true }
);
