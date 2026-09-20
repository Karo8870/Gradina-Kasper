import { z } from 'zod';

import { passwordSchema } from './shared';

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Confirmă parola.')
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: 'Parolele nu coincid.',
    path: ['passwordConfirm']
  });

export const resetPasswordActionSchema = resetPasswordSchema.and(
  z.object({ token: z.string().min(1) })
);

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordActionValues = z.infer<
  typeof resetPasswordActionSchema
>;
