import { z } from 'zod';

import { emailSchema, passwordSchema } from './shared';

export const createAccountSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Confirmă parola.')
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: 'Parolele nu coincid.',
    path: ['passwordConfirm']
  });

export type CreateAccountValues = z.infer<typeof createAccountSchema>;
