import { z } from 'zod';

export const twoFactorPasswordSchema = z.object({
  password: z.string().min(1, 'Parola este obligatorie.')
});

export const totpVerificationSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Introdu codul format din 6 cifre.')
});

export const backupAcknowledgementSchema = z.object({
  acknowledged: z.boolean().refine(Boolean, {
    message: 'Confirmă că ai salvat codurile de rezervă.'
  })
});

export type TwoFactorPasswordValues = z.infer<typeof twoFactorPasswordSchema>;
export type TOTPVerificationValues = z.infer<typeof totpVerificationSchema>;
export type BackupAcknowledgementValues = z.infer<
  typeof backupAcknowledgementSchema
>;
