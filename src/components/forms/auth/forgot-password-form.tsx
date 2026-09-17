'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { forgotPasswordAction } from '@/actions/auth';
import { FormField, FormSubmitButton } from '@/components/form-components';
import { safeInternalRedirect, withFeedback } from '@/features/auth/utils';

import { emailSchema } from './shared';

const forgotPasswordSchema = z.object({
  email: emailSchema
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema)
  });
  const redirect = safeInternalRedirect(searchParams.get('redirect'));

  async function onSubmit(values: ForgotPasswordValues) {
    await forgotPasswordAction(values).catch(() => undefined);
    router.replace(
      withFeedback(
        '/forgot-password',
        'success',
        'Dacă există un cont pentru această adresă, vei primi instrucțiuni pe email.',
        { redirect }
      )
    );
  }

  return (
    <form
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormField
        autoComplete='email'
        error={form.formState.errors.email}
        label='Email'
        registration={form.register('email')}
        type='email'
      />
      <FormSubmitButton isSubmitting={form.formState.isSubmitting}>
        Trimite instrucțiunile
      </FormSubmitButton>
    </form>
  );
}
