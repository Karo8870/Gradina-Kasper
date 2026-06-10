'use client';

import { Message } from '@/components/Message';
import { AuthHeaderIcon } from '@/components/forms/auth/shared/AuthHeaderIcon';
import { AuthInput } from '@/components/forms/auth/shared/AuthInput';
import { AuthPasswordInput } from '@/components/forms/auth/shared/AuthPasswordInput';
import { AuthSubmitButton } from '@/components/forms/auth/shared/AuthSubmitButton';
import { AuthSwitchCard } from '@/components/forms/auth/shared/AuthSwitchCard';
import { useAuth } from '@/providers/Auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, UserPlus } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  const redirect = useRef(searchParams.get('redirect'));
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<null | string>(null);

  const [showPassword, setShowPassword] = useState(false);

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register
  } = useForm<FormData>();

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data);
        if (redirect?.current) router.push(redirect.current);
        else router.push('/account');
      } catch (e) {
        setError('Datele de autentificare sunt incorecte. Te rugăm să încerci din nou.');
      }
    },
    [login, router]
  );

  return (
    <form
      className='mx-auto w-full max-w-3xl'
      onSubmit={handleSubmit(onSubmit)}
    >
      <AuthHeaderIcon>
        <LogIn className='size-11' strokeWidth={3} />
      </AuthHeaderIcon>

      <h1 className='mb-7 text-center text-3xl font-semibold tracking-tight text-neutral-800 md:text-4xl'>
        Autentificare
      </h1>

      <Message className='mb-6' error={error} />

      <div className='flex flex-col gap-5'>
        <AuthInput
          error={errors.email}
          label='Email'
          name='email'
          placeholder='Email'
          register={register('email', { required: 'Adresa de email este obligatorie.' })}
          type='email'
        />

        <AuthPasswordInput
          error={errors.password}
          label='Parolă'
          name='password'
          onToggle={() => setShowPassword((prev) => !prev)}
          placeholder='Parolă'
          register={register('password', {
            required: 'Parola este obligatorie.'
          })}
          showPassword={showPassword}
        />

        <p className='text-sm text-neutral-600'>
          Ai uitat parola?{' '}
          <Link
            href={`/forgot-password${allParams}`}
            className='text-primary-700 hover:text-primary-900 underline underline-offset-2'
          >
            Poți reseta parola aici
          </Link>
        </p>
      </div>

      <AuthSubmitButton loading={isLoading}>Autentifică-te</AuthSubmitButton>

      <AuthSwitchCard
        href={`/create-account${allParams}`}
        icon={<UserPlus className='size-5' />}
        text={
          <>
            Nu ai cont?
            <br />
            Poți crea unul aici.
          </>
        }
      />
    </form>
  );
};
