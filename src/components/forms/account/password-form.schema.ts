import { z } from 'zod';

import { passwordSchema } from '../auth/shared';

export const passwordSetupSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Confirmă parola.')
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: 'Parolele nu coincid.',
    path: ['passwordConfirm']
  });

export const changePasswordSchema = passwordSetupSchema.and(
  z.object({
    currentPassword: z.string().min(1, 'Parola curentă este obligatorie.')
  })
);

export type PasswordSetupValues = z.infer<typeof passwordSetupSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
