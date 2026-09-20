import { twoFactor } from 'better-auth/plugins';
import type { BasePayload } from 'payload';

import {
  twoFactorOTPEmailHTML,
  twoFactorOTPEmailSubject
} from '@/emails/auth/two-factor-otp';

import { twoFactorMode, TRUSTED_DEVICE_MAX_AGE } from './config';
import { providerAgnosticTwoFactor } from './provider-bridge';

export function getRuntimeTwoFactorPlugins(payload: BasePayload) {
  if (twoFactorMode === 'none') return [];

  const factorPlugin = twoFactor({
    accountLockout: {
      durationSeconds: 60 * 15,
      enabled: true,
      maxFailedAttempts: 10
    },
    backupCodeOptions: {
      amount: 10,
      length: 10,
      storeBackupCodes: 'encrypted'
    },
    issuer: 'Grădina Kasper',
    otpOptions:
      twoFactorMode === 'otp'
        ? {
            allowedAttempts: 5,
            digits: 6,
            period: 5,
            storeOTP: 'encrypted',
            sendOTP: async ({ otp, user }) => {
              await payload.sendEmail({
                html: twoFactorOTPEmailHTML({ otp }),
                subject: twoFactorOTPEmailSubject(),
                to: user.email
              });
            }
          }
        : undefined,
    totpOptions: {
      digits: 6,
      disable: twoFactorMode !== 'totp',
      period: 30
    },
    trustDeviceMaxAge: TRUSTED_DEVICE_MAX_AGE,
    twoFactorCookieMaxAge: 60 * 10
  });

  return [factorPlugin, providerAgnosticTwoFactor(twoFactorMode)];
}
