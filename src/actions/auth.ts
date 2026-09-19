'use server';

import { headers } from 'next/headers';

import { getBetterAuth, applyBetterAuthCookies } from '@/lib/auth/server';
import { getCMS } from '@/lib/cms';

type ActionResult = { success: boolean };

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
    const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
    const auth = getBetterAuth(payload);

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
    const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
    const auth = getBetterAuth(payload);

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
    const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
    const auth = getBetterAuth(payload);
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
    const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
    const auth = getBetterAuth(payload);
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
    const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
    const auth = getBetterAuth(payload);

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
