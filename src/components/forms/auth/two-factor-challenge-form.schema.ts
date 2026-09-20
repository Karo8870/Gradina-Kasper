import { z } from 'zod';

const sixDigitCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Introdu un cod format din 6 cifre.');
const backupCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/, 'Introdu un cod de rezervă valid.');

export const twoFactorChallengeSchema = z.object({
  code: z.union([sixDigitCodeSchema, backupCodeSchema]),
  trustDevice: z.boolean()
});

export const verifyTwoFactorActionSchema = z
  .object({
    code: z.string().trim(),
    method: z.enum(['backup', 'otp', 'totp']),
    trustDevice: z.boolean()
  })
  .superRefine(({ code, method }, context) => {
    const result =
      method === 'backup'
        ? backupCodeSchema.safeParse(code)
        : sixDigitCodeSchema.safeParse(code);

    if (!result.success) {
      context.addIssue({
        code: 'custom',
        message:
          method === 'backup'
            ? 'Introdu un cod de rezervă valid.'
            : 'Introdu un cod format din 6 cifre.',
        path: ['code']
      });
    }
  });

export type TwoFactorChallengeValues = z.infer<typeof twoFactorChallengeSchema>;
export type VerifyTwoFactorActionValues = z.infer<
  typeof verifyTwoFactorActionSchema
>;
