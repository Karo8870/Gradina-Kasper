'use server';

import {
  securityNotificationEmailHTML,
  securityNotificationEmailSubject,
  type SecurityNotification
} from '@/emails/auth/security-notification';
import {
  applyBetterAuthCookies,
  getBetterAuthRequest
} from '@/lib/auth/server';
import { twoFactorMode } from '@/lib/auth/two-factor/config';

type ActionResult = { success: boolean };
type EnableResult =
  | { success: false }
  | { mode: 'otp'; success: true }
  | {
      backupCodes: string[];
      mode: 'totp';
      success: true;
      totpURI: string;
    };

async function sendSecurityNotification(
  payload: Awaited<ReturnType<typeof getBetterAuthRequest>>['payload'],
  email: string,
  notification: SecurityNotification
) {
  try {
    await payload.sendEmail({
      html: securityNotificationEmailHTML(notification),
      subject: securityNotificationEmailSubject(notification),
      to: email
    });
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Notificarea de securitate nu a putut fi trimisă.'
    });
  }
}

export async function enableTwoFactorAction({
  password
}: {
  password: string;
}): Promise<EnableResult> {
  if (twoFactorMode === 'none' || !password) return { success: false };

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user || session.user.twoFactorEnabled) {
      return { success: false };
    }

    const { headers, response } = await auth.api.enableTwoFactor({
      body: {
        method: twoFactorMode,
        password
      },
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(headers);

    if (response.method === 'totp') {
      return {
        backupCodes: response.backupCodes,
        mode: 'totp',
        success: true,
        totpURI: response.totpURI
      };
    }

    await sendSecurityNotification(
      payload,
      session.user.email,
      'two-factor-enabled'
    );

    return { mode: 'otp', success: true };
  } catch {
    return { success: false };
  }
}

export async function verifyTOTPEnrollmentAction({
  code
}: {
  code: string;
}): Promise<ActionResult> {
  if (twoFactorMode !== 'totp' || !/^\d{6}$/.test(code)) {
    return { success: false };
  }

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user) return { success: false };

    const { headers } = await auth.api.verifyTOTP({
      body: { code },
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(headers);
    await sendSecurityNotification(
      payload,
      session.user.email,
      'two-factor-enabled'
    );

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function sendTwoFactorOTPAction(): Promise<ActionResult> {
  if (twoFactorMode !== 'otp') return { success: false };

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();

    await auth.api.sendTwoFactorOTP({ headers: requestHeaders });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function verifyTwoFactorAction({
  code,
  method,
  trustDevice
}: {
  code: string;
  method: 'backup' | 'otp' | 'totp';
  trustDevice: boolean;
}): Promise<ActionResult> {
  if (
    twoFactorMode === 'none' ||
    (method === 'otp' && twoFactorMode !== 'otp') ||
    ((method === 'backup' || method === 'totp') && twoFactorMode !== 'totp')
  ) {
    return { success: false };
  }

  try {
    const { auth, requestHeaders } = await getBetterAuthRequest();
    const result =
      method === 'backup'
        ? await auth.api.verifyBackupCode({
            body: { code, trustDevice },
            headers: requestHeaders,
            returnHeaders: true
          })
        : method === 'otp'
          ? await auth.api.verifyTwoFactorOTP({
              body: { code, trustDevice },
              headers: requestHeaders,
              returnHeaders: true
            })
          : await auth.api.verifyTOTP({
              body: { code, trustDevice },
              headers: requestHeaders,
              returnHeaders: true
            });

    await applyBetterAuthCookies(result.headers);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function disableTwoFactorAction({
  password
}: {
  password: string;
}): Promise<ActionResult> {
  if (twoFactorMode === 'none' || !password) return { success: false };

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.twoFactorEnabled) return { success: false };

    const { headers } = await auth.api.disableTwoFactor({
      body: { password },
      headers: requestHeaders,
      returnHeaders: true
    });

    await applyBetterAuthCookies(headers);
    await sendSecurityNotification(
      payload,
      session.user.email,
      'two-factor-disabled'
    );

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function regenerateBackupCodesAction({
  password
}: {
  password: string;
}): Promise<
  | { backupCodes: string[]; success: true }
  | { backupCodes?: never; success: false }
> {
  if (twoFactorMode !== 'totp' || !password) return { success: false };

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.twoFactorEnabled) return { success: false };

    const response = await auth.api.generateBackupCodes({
      body: { password },
      headers: requestHeaders
    });

    await sendSecurityNotification(
      payload,
      session.user.email,
      'backup-codes-regenerated'
    );

    return { backupCodes: response.backupCodes, success: true };
  } catch {
    return { success: false };
  }
}
