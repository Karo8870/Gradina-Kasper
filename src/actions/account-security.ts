'use server';

import { z } from 'zod';

import {
  changePasswordSchema,
  passwordSetupSchema,
  type ChangePasswordValues,
  type PasswordSetupValues
} from '@/components/forms/account/password-form.schema';
import { withFeedback } from '@/lib/auth/utils';
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

const socialProviderInputSchema = z.object({
  provider: z.string().min(1)
});
const socialAccountInputSchema = socialProviderInputSchema.extend({
  accountId: z.string().min(1)
});
const sessionInputSchema = z.object({
  sessionId: z.string().min(1)
});

export async function linkSocialAccountAction(input: {
  provider: SocialProviderId;
}): Promise<SocialLinkResult> {
  const parsed = socialProviderInputSchema.safeParse(input);
  const provider = parsed.success
    ? getSocialProvider(parsed.data.provider)
    : undefined;

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

export async function unlinkSocialAccountAction(input: {
  accountId: string;
  provider: SocialProviderId;
}): Promise<ActionResult> {
  const parsed = socialAccountInputSchema.safeParse(input);
  const provider = parsed.success
    ? getSocialProvider(parsed.data.provider)
    : undefined;

  if (!parsed.success || !provider) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders
    });
    const socialAccount = accounts.find(
      (account) =>
        account.id === parsed.data.accountId &&
        account.providerId === provider.id
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

export async function setPasswordAction(
  input: PasswordSetupValues
): Promise<ActionResult> {
  const parsed = passwordSetupSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders
    });

    if (accounts.some((account) => account.providerId === 'credential')) {
      return { success: false };
    }

    await auth.api.setPassword({
      body: { newPassword: parsed.data.password },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function changePasswordAction(
  input: ChangePasswordValues
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders } = await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.password,
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

export async function revokeAccountSessionAction(input: {
  sessionId: string;
}): Promise<ActionResult> {
  const parsed = sessionInputSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const [currentSession, sessions] = await Promise.all([
      auth.api.getSession({ headers: requestHeaders }),
      auth.api.listSessions({ headers: requestHeaders })
    ]);

    if (
      !currentSession?.session ||
      currentSession.session.id === parsed.data.sessionId
    ) {
      return { success: false };
    }

    const session = sessions.find((item) => item.id === parsed.data.sessionId);

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
