'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { resetPasswordAction } from '@/actions/auth/auth';
import {
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import { safeInternalRedirect, withFeedback } from '@/lib/auth/utils';

import {
  resetPasswordSchema,
  type ResetPasswordValues
} from './reset-password-form.schema';

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
            '/login',
            'success',
            'Parola a fost actualizată. Te poți autentifica.',
            { redirect }
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
