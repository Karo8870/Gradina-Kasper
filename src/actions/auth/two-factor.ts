'use server';

import {
  totpVerificationSchema,
  twoFactorPasswordSchema,
  type TOTPVerificationValues,
  type TwoFactorPasswordValues
} from '@/components/forms/account/two-factor-settings.schema';
import {
  verifyTwoFactorActionSchema,
  type VerifyTwoFactorActionValues
} from '@/components/forms/auth/two-factor-challenge-form.schema';
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

export async function enableTwoFactorAction(
  input: TwoFactorPasswordValues
): Promise<EnableResult> {
  const parsed = twoFactorPasswordSchema.safeParse(input);

  if (twoFactorMode === 'none' || !parsed.success) {
    return { success: false };
  }

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user || session.user.twoFactorEnabled) {
      return { success: false };
    }

    const { headers, response } = await auth.api.enableTwoFactor({
      body: {
        method: twoFactorMode,
        password: parsed.data.password
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

export async function verifyTOTPEnrollmentAction(
  input: TOTPVerificationValues
): Promise<ActionResult> {
  const parsed = totpVerificationSchema.safeParse(input);

  if (twoFactorMode !== 'totp' || !parsed.success) {
    return { success: false };
  }

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user) return { success: false };

    const { headers } = await auth.api.verifyTOTP({
      body: { code: parsed.data.code },
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

export async function verifyTwoFactorAction(
  input: VerifyTwoFactorActionValues
): Promise<ActionResult> {
  const parsed = verifyTwoFactorActionSchema.safeParse(input);

  if (!parsed.success) return { success: false };

  const { code, method, trustDevice } = parsed.data;

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

export async function disableTwoFactorAction(
  input: TwoFactorPasswordValues
): Promise<ActionResult> {
  const parsed = twoFactorPasswordSchema.safeParse(input);

  if (twoFactorMode === 'none' || !parsed.success) {
    return { success: false };
  }

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.twoFactorEnabled) return { success: false };

    const { headers } = await auth.api.disableTwoFactor({
      body: { password: parsed.data.password },
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

export async function regenerateBackupCodesAction(
  input: TwoFactorPasswordValues
): Promise<
  | { backupCodes: string[]; success: true }
  | { backupCodes?: never; success: false }
> {
  const parsed = twoFactorPasswordSchema.safeParse(input);

  if (twoFactorMode !== 'totp' || !parsed.success) {
    return { success: false };
  }

  try {
    const { auth, payload, requestHeaders } = await getBetterAuthRequest();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.twoFactorEnabled) return { success: false };

    const response = await auth.api.generateBackupCodes({
      body: { password: parsed.data.password },
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
