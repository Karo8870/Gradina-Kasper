import envConfig from '../../../../env.config';

export type TwoFactorMode = 'none' | 'otp' | 'totp';

export const twoFactorMode = envConfig.TFA_MODE as TwoFactorMode;

export const twoFactorCapabilities = {
  enabled: twoFactorMode !== 'none',
  mode: twoFactorMode,
  supportsBackupCodes: twoFactorMode === 'totp'
} as const;

export const TWO_FACTOR_CHALLENGE_MAX_AGE = 60 * 10;
export const TRUSTED_DEVICE_MAX_AGE = 60 * 60 * 24 * 30;
