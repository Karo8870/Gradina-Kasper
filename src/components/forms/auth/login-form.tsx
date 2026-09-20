'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { loginAction } from '@/actions/auth';
import {
  FormField,
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import {
  redirectQuery,
  safeInternalRedirect,
  withFeedback,
  withSafeRedirect
} from '@/features/auth/utils';
import { socialProviders } from '@/lib/auth/social-providers';

import { SocialAuthButton } from './social-auth-button';
import { emailSchema } from './shared';

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Parola este obligatorie.')
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<LoginValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  });
  const redirect = safeInternalRedirect(searchParams.get('redirect'));
  const query = redirectQuery(searchParams);

  async function onSubmit(values: LoginValues) {
    const result = await loginAction(values).catch(() => ({
      status: 'error' as const
    }));

    if (result.status === 'success') {
      router.replace(redirect ?? '/account');
      router.refresh();
      return;
    }

    if (result.status === 'two-factor') {
      router.replace(withSafeRedirect('/two-factor', redirect));
      return;
    }

    router.replace(
      withFeedback(
        '/login',
        'error',
        'Datele de autentificare sunt incorecte.',
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
      <FormPasswordField
        autoComplete='current-password'
        error={form.formState.errors.password}
        label='Parola'
        registration={form.register('password')}
      />
      <Link
        className='text-sm underline underline-offset-4'
        href={`/forgot-password${query}`}
      >
        Ai uitat parola?
      </Link>
      <FormSubmitButton isSubmitting={form.formState.isSubmitting}>
        Autentifică-te
      </FormSubmitButton>
      {socialProviders.map((provider) => (
        <SocialAuthButton
          feedbackPath='/login'
          key={provider.id}
          provider={provider.id}
        />
      ))}
      <p className='text-muted-foreground text-sm'>
        Nu ai cont?{' '}
        <Link
          className='text-foreground underline underline-offset-4'
          href={`/create-account${query}`}
        >
          Creează unul
        </Link>
      </p>
    </form>
  );
}
