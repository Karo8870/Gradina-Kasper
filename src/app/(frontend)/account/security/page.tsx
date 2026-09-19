import { headers } from 'next/headers';

import { AccountSecurity } from '@/components/account/account-security';
import { AuthFeedback } from '@/features/auth/auth-feedback';
import { getBetterAuth } from '@/lib/auth/server';
import { formatSessionDevice } from '@/lib/auth/sessions';
import { getCMS } from '@/lib/cms';
import { socialProviders } from '@/lib/auth/social-providers';
import { staticMetadata } from '@/lib/static-metadata';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AccountSecurityPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, payload, requestHeaders] = await Promise.all([
    searchParams,
    getCMS(),
    headers()
  ]);
  const auth = getBetterAuth(payload);
  const [accounts, currentSession, sessions] = await Promise.all([
    auth.api.listUserAccounts({ headers: requestHeaders }),
    auth.api.getSession({ headers: requestHeaders }),
    auth.api.listSessions({ headers: requestHeaders })
  ]);
  const socialAccountIds = Object.fromEntries(
    socialProviders.flatMap((provider) => {
      const account = accounts.find((item) => item.providerId === provider.id);

      return account ? [[provider.id, account.id]] : [];
    })
  );

  return (
    <>
      <AuthFeedback searchParams={params} />
      <AccountSecurity
        hasPassword={accounts.some(
          (account) => account.providerId === 'credential'
        )}
        socialAccountIds={socialAccountIds}
        sessions={sessions.map((session) => ({
          device: formatSessionDevice(session.userAgent),
          id: session.id,
          isCurrent: session.id === currentSession?.session.id,
          updatedAt: session.updatedAt.toISOString()
        }))}
      />
    </>
  );
}

export const metadata = staticMetadata(
  'Securitate',
  'Gestionează metodele de autentificare ale contului tău.',
  '/account/security',
  { noIndex: true }
);
