import { LogoutForm } from '@/components/forms/auth/logout-form';
import { AuthPage } from '@/features/auth/auth-page';
import { staticMetadata } from '@/lib/static-metadata';

export default function LogoutPage() {
  return (
    <AuthPage description='Te deconectam in siguranta.' title='Deconectare'>
      <LogoutForm />
    </AuthPage>
  );
}

export const metadata = staticMetadata(
  'Deconectare',
  'Închiderea sesiunii tale.',
  '/logout',
  { noIndex: true }
);
