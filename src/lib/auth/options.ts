import type { BetterAuthOptions } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';

const schemaTwoFactorPlugin = twoFactor({
  backupCodeOptions: {
    amount: 10,
    storeBackupCodes: 'encrypted'
  },
  otpOptions: {
    storeOTP: 'encrypted',
    sendOTP: async () => undefined
  },
  totpOptions: {
    digits: 6,
    period: 30
  }
});

export const betterAuthOptions = {
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: false
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 15,
    revokeSessionsOnPasswordReset: true
  },
  emailVerification: {
    autoSignInAfterVerification: false,
    sendOnSignUp: true
  },
  plugins: [schemaTwoFactorPlugin]
} satisfies BetterAuthOptions;
