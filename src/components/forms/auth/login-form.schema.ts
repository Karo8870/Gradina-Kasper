import { z } from 'zod';

import { emailSchema } from './shared';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Parola este obligatorie.')
});

export type LoginValues = z.infer<typeof loginSchema>;
