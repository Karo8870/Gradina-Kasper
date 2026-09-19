'use server';

import { withFeedback } from '@/features/auth/utils';
import {
  applyBetterAuthCookies,
  getBetterAuthRequest
} from '@/lib/auth/server';
import {
  getSocialProvider,
  type SocialProviderId
} from '@/lib/auth/social-providers';

type ActionResult = { success: boolean };
type SocialLinkResult =
  { success: true; url: string } | { success: false; url?: never };

function hasValidPassword(password: string, passwordConfirm: string) {
  return password === passwordConfirm && password.length >= 8;
}

export async function linkSocialAccountAction({
  provider: providerId
}: {
  provider: SocialProviderId;
}): Promise<SocialLinkResult> {
  const provider = getSocialProvider(providerId);

  if (!provider) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders, response } =
      await auth.api.linkSocialAccount({
        body: {
          callbackURL: withFeedback(
            '/account/security',
            'success',
            `Contul ${provider.name} a fost conectat.`
          ),
          errorCallbackURL: withFeedback(
            '/account/security',
            'error',
            `Contul ${provider.name} nu a putut fi conectat.`
          ),
          provider: provider.id
        },
        headers: requestHeaders,
        returnHeaders: true
      });

    await applyBetterAuthCookies(responseHeaders);

    return response.url
      ? { success: true, url: response.url }
      : { success: false };
  } catch {
    return { success: false };
  }
}

export async function unlinkSocialAccountAction({
  accountId,
  provider: providerId
}: {
  accountId: string;
  provider: SocialProviderId;
}): Promise<ActionResult> {
  const provider = getSocialProvider(providerId);

  if (!provider) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders
    });
    const socialAccount = accounts.find(
      (account) =>
        account.id === accountId && account.providerId === provider.id
    );

    if (!socialAccount) return { success: false };

    await auth.api.unlinkAccount({
      body: { accountId: socialAccount.id },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function setPasswordAction({
  password,
  passwordConfirm
}: {
  password: string;
  passwordConfirm: string;
}): Promise<ActionResult> {
  if (!hasValidPassword(password, passwordConfirm)) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders
    });

    if (accounts.some((account) => account.providerId === 'credential')) {
      return { success: false };
    }

    await auth.api.setPassword({
      body: { newPassword: password },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function changePasswordAction({
  currentPassword,
  password,
  passwordConfirm
}: {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}): Promise<ActionResult> {
  if (!currentPassword || !hasValidPassword(password, passwordConfirm)) {
    return { success: false };
  }

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders } = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword: password,
        revokeOtherSessions: true
      },
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(responseHeaders);

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function revokeAccountSessionAction({
  sessionId
}: {
  sessionId: string;
}): Promise<ActionResult> {
  if (!sessionId) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const [currentSession, sessions] = await Promise.all([
      auth.api.getSession({ headers: requestHeaders }),
      auth.api.listSessions({ headers: requestHeaders })
    ]);

    if (!currentSession?.session || currentSession.session.id === sessionId) {
      return { success: false };
    }

    const session = sessions.find((item) => item.id === sessionId);

    if (!session) return { success: false };

    await auth.api.revokeSession({
      body: { token: session.token },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function revokeOtherAccountSessionsAction(): Promise<ActionResult> {
  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.revokeOtherSessions({ headers: requestHeaders });

    return { success: true };
  } catch {
    return { success: false };
  }
}
