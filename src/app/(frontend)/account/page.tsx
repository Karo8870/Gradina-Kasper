import { Mail } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/current-user';
import { staticMetadata } from '@/lib/static-metadata';

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <div className='flex max-w-2xl flex-col gap-6'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold'>Contul meu</h1>
        <p className='text-muted-foreground text-sm'>Datele contului tău.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Informații de cont</CardTitle>
          <CardDescription>
            Adresa folosită pentru autentificare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-3'>
            <Mail aria-hidden='true' className='text-muted-foreground size-4' />
            <div className='min-w-0'>
              <p className='text-muted-foreground text-sm'>Email</p>
              <p className='truncate font-medium'>{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = staticMetadata(
  'Contul meu',
  'Vezi datele contului tău.',
  '/account',
  { noIndex: true }
);
