'use server';

import { login, logout } from '@payloadcms/next/auth';
import config from '@payload-config';
import { getPayload } from 'payload';

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
    const payload = await getPayload({ config });

    await payload.create({
      collection: 'users',
      data: { email, password, roles: ['customer'] },
      draft: false,
      overrideAccess: false
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
    const payload = await getPayload({ config });

    await payload.forgotPassword({
      collection: 'users',
      data: { email },
      overrideAccess: false
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
    await login({ collection: 'users', config, email, password });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const result = await logout({ allSessions: false, config });
    return { success: result.success };
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
    const payload = await getPayload({ config });
    const result = await payload.resetPassword({
      collection: 'users',
      data: { password, token },
      overrideAccess: false
    });

    const email = result.user.email;

    if (typeof email !== 'string') {
      return { success: false };
    }

    await login({
      collection: 'users',
      config,
      email,
      password
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
