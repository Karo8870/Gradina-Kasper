'use client';

import {
  KeyRound,
  Link2,
  LoaderCircle,
  MonitorSmartphone,
  ShieldCheck,
  Unlink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  linkSocialAccountAction,
  revokeAccountSessionAction,
  revokeOtherAccountSessionsAction,
  unlinkSocialAccountAction
} from '@/actions/account-security';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { withFeedback } from '@/features/auth/utils';
import {
  socialProviders,
  type SocialProviderId
} from '@/lib/auth/social-providers';

import {
  ChangePasswordForm,
  PasswordSetupForm
} from '../forms/account/password-form';
import { TwoFactorSettings } from '../forms/account/two-factor-settings';
import type { TwoFactorMode } from '@/lib/auth/two-factor/config';

export function AccountSecurity({
  hasPassword,
  socialAccountIds,
  sessions,
  twoFactor
}: {
  hasPassword: boolean;
  socialAccountIds: Partial<Record<SocialProviderId, string>>;
  sessions: Array<{
    device: string;
    id: string;
    isCurrent: boolean;
    updatedAt: string;
  }>;
  twoFactor?: {
    enabled: boolean;
    mode: Exclude<TwoFactorMode, 'none'>;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [disconnectingProvider, setDisconnectingProvider] =
    useState<SocialProviderId>();
  const [disconnectingSessionId, setDisconnectingSessionId] =
    useState<string>();
  const [isConfirmingOtherSessions, setIsConfirmingOtherSessions] =
    useState(false);
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);

  function linkSocialAccount(provider: SocialProviderId) {
    startTransition(async () => {
      const socialProvider = socialProviders.find(
        (item) => item.id === provider
      );
      const result = await linkSocialAccountAction({ provider }).catch(() => ({
        success: false as const
      }));

      if (result.success) {
        window.location.assign(result.url);
        return;
      }

      router.replace(
        withFeedback(
          '/account/security',
          'error',
          `Conectarea contului ${socialProvider?.name ?? ''} nu a putut fi pornită.`
        )
      );
    });
  }

  function unlinkSocialAccount(provider: SocialProviderId) {
    const accountId = socialAccountIds[provider];

    if (!accountId) return;

    startTransition(async () => {
      const socialProvider = socialProviders.find(
        (item) => item.id === provider
      );
      const result = await unlinkSocialAccountAction({
        accountId,
        provider
      }).catch(() => ({ success: false }));

      setDisconnectingProvider(undefined);
      router.replace(
        withFeedback(
          '/account/security',
          result.success ? 'success' : 'error',
          result.success
            ? `Contul ${socialProvider?.name ?? ''} a fost deconectat.`
            : `Contul ${socialProvider?.name ?? ''} nu a putut fi deconectat. Autentifică-te din nou și încearcă din nou.`
        )
      );
    });
  }

  function revokeSession(sessionId: string) {
    startTransition(async () => {
      const result = await revokeAccountSessionAction({ sessionId }).catch(
        () => ({ success: false })
      );

      setDisconnectingSessionId(undefined);
      router.replace(
        withFeedback(
          '/account/security',
          result.success ? 'success' : 'error',
          result.success
            ? 'Dispozitivul a fost deconectat.'
            : 'Dispozitivul nu a putut fi deconectat. Autentifică-te din nou și încearcă din nou.'
        )
      );
    });
  }

  function revokeOtherSessions() {
    startTransition(async () => {
      const result = await revokeOtherAccountSessionsAction().catch(() => ({
        success: false
      }));

      setIsConfirmingOtherSessions(false);
      router.replace(
        withFeedback(
          '/account/security',
          result.success ? 'success' : 'error',
          result.success
            ? 'Celelalte dispozitive au fost deconectate.'
            : 'Dispozitivele nu au putut fi deconectate. Autentifică-te din nou și încearcă din nou.'
        )
      );
    });
  }

  return (
    <div className='flex max-w-2xl flex-col gap-6'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold'>Securitate</h1>
        <p className='text-muted-foreground text-sm'>
          Gestionează metodele folosite pentru autentificare.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Metode de autentificare</CardTitle>
          <CardDescription>
            Păstrează cel puțin o metodă activă pentru a-ți putea accesa contul.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-5'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <KeyRound aria-hidden='true' className='size-5' />
              <div>
                <p className='font-medium'>Email și parolă</p>
                <p className='text-muted-foreground text-sm'>
                  {hasPassword ? 'Configurată' : 'Neconfigurată'}
                </p>
              </div>
            </div>
          </div>

          <div className='border-t pt-5'>
            {hasPassword ? <ChangePasswordForm /> : <PasswordSetupForm />}
          </div>

          {socialProviders.map((provider) => {
            const Icon = provider.icon;
            const accountId = socialAccountIds[provider.id];
            const isDisconnecting = disconnectingProvider === provider.id;

            return (
              <div
                className='flex flex-col gap-5 border-t pt-5'
                key={provider.id}
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <Icon className='size-5 shrink-0' />
                    <div>
                      <p className='font-medium'>{provider.name}</p>
                      <p className='text-muted-foreground text-sm'>
                        {accountId ? 'Conectat' : 'Neconectat'}
                      </p>
                    </div>
                  </div>

                  {accountId ? (
                    <Button
                      disabled={isPending}
                      onClick={() => setDisconnectingProvider(provider.id)}
                      type='button'
                      variant='outline'
                    >
                      <Unlink />
                      Deconectează
                    </Button>
                  ) : (
                    <Button
                      disabled={isPending}
                      onClick={() => linkSocialAccount(provider.id)}
                      type='button'
                      variant='outline'
                    >
                      {isPending ? (
                        <LoaderCircle className='animate-spin' />
                      ) : (
                        <Link2 />
                      )}
                      Conectează
                    </Button>
                  )}
                </div>

                {isDisconnecting ? (
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-sm'>
                      Nu vei mai putea folosi {provider.name} pentru
                      autentificare.
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        disabled={isPending}
                        onClick={() => setDisconnectingProvider(undefined)}
                        type='button'
                        variant='outline'
                      >
                        Renunță
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={() => unlinkSocialAccount(provider.id)}
                        type='button'
                        variant='destructive'
                      >
                        {isPending ? (
                          <LoaderCircle className='animate-spin' />
                        ) : null}
                        Confirmă deconectarea
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {twoFactor ? (
        <TwoFactorSettings
          enabled={twoFactor.enabled}
          hasPassword={hasPassword}
          mode={twoFactor.mode}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Sesiuni active</CardTitle>
          <CardDescription>
            Dispozitivele care sunt conectate în acest moment la contul tău.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-5'>
          {sessions.map((session) => {
            const isDisconnecting = disconnectingSessionId === session.id;

            return (
              <div
                className='flex flex-col gap-4 border-t pt-5'
                key={session.id}
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <MonitorSmartphone
                      aria-hidden='true'
                      className='size-5 shrink-0'
                    />
                    <div>
                      <p className='font-medium'>
                        {session.isCurrent
                          ? 'Acest dispozitiv'
                          : session.device}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {session.isCurrent
                          ? `${session.device}, activ acum`
                          : `Ultima activitate: ${new Intl.DateTimeFormat(
                              'ro-RO',
                              {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              }
                            ).format(new Date(session.updatedAt))}`}
                      </p>
                    </div>
                  </div>

                  {!session.isCurrent ? (
                    <Button
                      disabled={isPending}
                      onClick={() => setDisconnectingSessionId(session.id)}
                      type='button'
                      variant='outline'
                    >
                      <Unlink />
                      Deconectează
                    </Button>
                  ) : null}
                </div>

                {isDisconnecting ? (
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-sm'>
                      Acest dispozitiv nu va mai putea accesa contul.
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        disabled={isPending}
                        onClick={() => setDisconnectingSessionId(undefined)}
                        type='button'
                        variant='outline'
                      >
                        Renunță
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={() => revokeSession(session.id)}
                        type='button'
                        variant='destructive'
                      >
                        {isPending ? (
                          <LoaderCircle className='animate-spin' />
                        ) : null}
                        Confirmă deconectarea
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {hasOtherSessions ? (
            <div className='flex flex-col gap-4 border-t pt-5'>
              {isConfirmingOtherSessions ? (
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <p className='text-sm'>
                    Vei fi deconectat de pe toate celelalte dispozitive.
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      disabled={isPending}
                      onClick={() => setIsConfirmingOtherSessions(false)}
                      type='button'
                      variant='outline'
                    >
                      Renunță
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={revokeOtherSessions}
                      type='button'
                      variant='destructive'
                    >
                      {isPending ? (
                        <LoaderCircle className='animate-spin' />
                      ) : null}
                      Confirmă deconectarea
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className='self-start'
                  disabled={isPending}
                  onClick={() => setIsConfirmingOtherSessions(true)}
                  type='button'
                  variant='outline'
                >
                  <Unlink />
                  Deconectează celelalte dispozitive
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className='text-muted-foreground flex items-start gap-3 text-sm'>
        <ShieldCheck aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
        <p>Schimbarea parolei deconectează celelalte sesiuni ale contului.</p>
      </div>
    </div>
  );
}
