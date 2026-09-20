'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { createAccountAction } from '@/actions/auth/auth';
import {
  FormField,
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import {
  redirectQuery,
  safeInternalRedirect,
  withFeedback
} from '@/lib/auth/utils';
import { socialProviders } from '@/lib/auth/social-providers';

import {
  createAccountSchema,
  type CreateAccountValues
} from './create-account-form.schema';
import { SocialAuthButton } from './social-auth-button';

export function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<CreateAccountValues>({
    defaultValues: { email: '', password: '', passwordConfirm: '' },
    resolver: zodResolver(createAccountSchema)
  });
  const redirect = safeInternalRedirect(searchParams.get('redirect'));
  const query = redirectQuery(searchParams);

  async function onSubmit(values: CreateAccountValues) {
    const result = await createAccountAction(values).catch(() => ({
      success: false
    }));

    router.replace(
      result.success
        ? withFeedback(
            '/create-account',
            'success',
            'Contul a fost creat. Verifică emailul pentru activare.',
            { redirect }
          )
        : withFeedback('/create-account', 'error', 'Nu am putut crea contul.', {
            redirect
          })
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
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.password}
        label='Parola'
        registration={form.register('password')}
      />
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.passwordConfirm}
        label='Confirmă parola'
        registration={form.register('passwordConfirm')}
      />
      <FormSubmitButton isSubmitting={form.formState.isSubmitting}>
        Creează contul
      </FormSubmitButton>
      {socialProviders.map((provider) => (
        <SocialAuthButton
          feedbackPath='/create-account'
          key={provider.id}
          provider={provider.id}
        />
      ))}
      <p className='text-muted-foreground text-sm'>
        Ai deja cont?{' '}
        <Link
          className='text-foreground underline underline-offset-4'
          href={`/login${query}`}
        >
          Autentifică-te
        </Link>
      </p>
    </form>
  );
}
