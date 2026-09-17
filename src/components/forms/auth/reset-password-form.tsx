'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { resetPasswordAction } from '@/actions/auth';
import {
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import { safeInternalRedirect, withFeedback } from '@/features/auth/utils';

import { passwordSchema } from './shared';

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Confirmă parola.')
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: 'Parolele nu coincid.',
    path: ['passwordConfirm']
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<ResetPasswordValues>({
    defaultValues: { password: '', passwordConfirm: '' },
    resolver: zodResolver(resetPasswordSchema)
  });
  const redirect = safeInternalRedirect(searchParams.get('redirect'));

  async function onSubmit(values: ResetPasswordValues) {
    const result = await resetPasswordAction({ ...values, token }).catch(
      () => ({
        success: false
      })
    );

    router.replace(
      result.success
        ? withFeedback(
            redirect ?? '/account',
            'success',
            'Parola a fost actualizată cu succes.'
          )
        : withFeedback(
            '/confirm-password-reset',
            'error',
            'Linkul de resetare este invalid sau a expirat.',
            { token }
          )
    );
    router.refresh();
  }

  return (
    <form
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.password}
        label='Parola nouă'
        registration={form.register('password')}
      />
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.passwordConfirm}
        label='Confirmă parola nouă'
        registration={form.register('passwordConfirm')}
      />
      <FormSubmitButton isSubmitting={form.formState.isSubmitting}>
        Resetează parola
      </FormSubmitButton>
    </form>
  );
}
