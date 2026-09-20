'use server';

import { safeInternalRedirect, withFeedback } from '@/lib/auth/utils';
import {
  applyBetterAuthCookies,
  getBetterAuthRequest
} from '@/lib/auth/server';
import {
  getSocialProvider,
  type SocialProviderId
} from '@/lib/auth/social-providers';
import {
  createAccountSchema,
  type CreateAccountValues
} from '@/components/forms/auth/create-account-form.schema';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues
} from '@/components/forms/auth/forgot-password-form.schema';
import {
  loginSchema,
  type LoginValues
} from '@/components/forms/auth/login-form.schema';
import {
  resetPasswordActionSchema,
  type ResetPasswordActionValues
} from '@/components/forms/auth/reset-password-form.schema';

type ActionResult = { success: boolean };
export type LoginActionResult =
  { status: 'error' } | { status: 'success' } | { status: 'two-factor' };
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

export async function createAccountAction(
  input: CreateAccountValues
): Promise<ActionResult> {
  const parsed = createAccountSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { email, password } = parsed.data;

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

export async function forgotPasswordAction(
  input: ForgotPasswordValues
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) return { success: true };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email },
      headers: requestHeaders
    });
  } catch {
    // Keep the response identical so this endpoint cannot reveal registered emails.
  }

  return { success: true };
}

export async function loginAction(
  input: LoginValues
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) return { status: 'error' };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const { headers: responseHeaders, response } = await auth.api.signInEmail({
      body: parsed.data,
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(responseHeaders);
    return response &&
      'twoFactorRedirect' in response &&
      response.twoFactorRedirect
      ? { status: 'two-factor' }
      : { status: 'success' };
  } catch {
    return { status: 'error' };
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

export async function resetPasswordAction(
  input: ResetPasswordActionValues
): Promise<ActionResult> {
  const parsed = resetPasswordActionSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.resetPassword({
      body: {
        newPassword: parsed.data.password,
        token: parsed.data.token
      },
      headers: requestHeaders
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
