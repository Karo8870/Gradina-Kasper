'use client';

import { LoaderCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { socialLoginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  getSocialProvider,
  type SocialProviderId
} from '@/lib/auth/social-providers';
import { safeInternalRedirect, withFeedback } from '@/features/auth/utils';

export function SocialAuthButton({
  feedbackPath,
  provider: socialProviderId
}: {
  feedbackPath: '/create-account' | '/login';
  provider: SocialProviderId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const provider = getSocialProvider(socialProviderId);
  const redirect = safeInternalRedirect(searchParams.get('redirect'));

  if (!provider) return null;

  const Icon = provider.icon;
  const providerId = provider.id;
  const providerName = provider.name;

  function signInWithProvider() {
    startTransition(async () => {
      const result = await socialLoginAction({
        feedbackPath,
        provider: providerId,
        redirect
      }).catch(() => ({ success: false as const }));

      if (result.success) {
        window.location.assign(result.url);
        return;
      }

      router.replace(
        withFeedback(
          feedbackPath,
          'error',
          `Autentificarea cu ${providerName} nu a putut fi pornită.`,
          { redirect }
        )
      );
    });
  }

  return (
    <Button
      disabled={isPending}
      onClick={signInWithProvider}
      type='button'
      variant='outline'
    >
      {isPending ? (
        <LoaderCircle className='animate-spin' />
      ) : (
        <Icon className='size-5' />
      )}
      {isPending ? 'Se conectează...' : provider.loginLabel}
    </Button>
  );
}
