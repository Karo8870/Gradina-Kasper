'use server';

import { safeInternalRedirect, withFeedback } from '@/features/auth/utils';
import {
  applyBetterAuthCookies,
  getBetterAuthRequest
} from '@/lib/auth/server';
import {
  getSocialProvider,
  type SocialProviderId
} from '@/lib/auth/social-providers';

type ActionResult = { success: boolean };
type SocialAuthResult =
  { success: true; url: string } | { success: false; url?: never };

const socialFeedbackPaths = ['/login', '/create-account'] as const;

export async function socialLoginAction({
  feedbackPath,
  provider: providerId,
  redirect
}: {
  feedbackPath: (typeof socialFeedbackPaths)[number];
  provider: SocialProviderId;
  redirect?: string;
}): Promise<SocialAuthResult> {
  const safeRedirect = safeInternalRedirect(redirect) ?? '/account';
  const provider = getSocialProvider(providerId);
  const safeFeedbackPath = socialFeedbackPaths.includes(feedbackPath)
    ? feedbackPath
    : '/login';

  if (!provider) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders, response } = await auth.api.signInSocial({
      body: {
        callbackURL: safeRedirect,
        errorCallbackURL: withFeedback(
          safeFeedbackPath,
          'error',
          `Autentificarea cu ${provider.name} nu a reușit.`,
          { redirect: safeInternalRedirect(redirect) }
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

export async function createAccountAction({
  email,
  password,
  passwordConfirm
}: {
  email: string;
  password: string;
  passwordConfirm: string;
}): Promise<ActionResult> {
  if (password !== passwordConfirm) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.signUpEmail({
      body: {
        email,
        name: email,
        password
      },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function forgotPasswordAction({
  email
}: {
  email: string;
}): Promise<ActionResult> {
  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.requestPasswordReset({
      body: { email },
      headers: requestHeaders
    });
  } catch {
    // Keep the response identical so this endpoint cannot reveal registered emails.
  }

  return { success: true };
}

export async function loginAction({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders } = await auth.api.signInEmail({
      body: { email, password },
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(responseHeaders);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders } = await auth.api.signOut({
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(responseHeaders);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function resetPasswordAction({
  password,
  passwordConfirm,
  token
}: {
  password: string;
  passwordConfirm: string;
  token: string;
}): Promise<ActionResult> {
  if (password !== passwordConfirm) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token
      },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
