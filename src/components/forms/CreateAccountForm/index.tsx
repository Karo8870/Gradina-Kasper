'use client';

import { Message } from '@/components/Message';
import { AuthHeaderIcon } from '@/components/forms/auth/shared/AuthHeaderIcon';
import { AuthInput } from '@/components/forms/auth/shared/AuthInput';
import { AuthPasswordInput } from '@/components/forms/auth/shared/AuthPasswordInput';
import { AuthSubmitButton } from '@/components/forms/auth/shared/AuthSubmitButton';
import { AuthSwitchCard } from '@/components/forms/auth/shared/AuthSwitchCard';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, UserPlus } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  const router = useRouter();
  const [loading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch
  } = useForm<FormData>();

  const password = useRef({});
  password.current = watch('password', '');

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`,
        {
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      );

      if (!response.ok) {
        const message =
          response.statusText || 'A apărut o eroare la crearea contului.';
        setError(message);
        return;
      }

      router.push(
        `/create-account?success=${encodeURIComponent(
          'Contul a fost creat cu succes. Verifică-ți emailul pentru a-ți activa contul.'
        )}`
      );
    },
    [router]
  );

  return (
    <form
      className='mx-auto w-full max-w-3xl'
      onSubmit={handleSubmit(onSubmit)}
    >
      <AuthHeaderIcon>
        <UserPlus strokeWidth={3} className='size-11' />
      </AuthHeaderIcon>

      <h1 className='mb-7 text-center text-3xl font-semibold tracking-tight text-neutral-800 md:text-4xl'>
        Înregistrare
      </h1>

      <Message className='mb-6' error={error} />

      <div className='flex flex-col gap-5'>
        <AuthInput
          error={errors.email}
          label='Email'
          name='email'
          placeholder='Email'
          register={register('email', {
            required: 'Adresa de email este obligatorie.'
          })}
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

        <AuthPasswordInput
          error={errors.passwordConfirm}
          label='Confirmare parolă'
          name='passwordConfirm'
          onToggle={() => setShowPasswordConfirm((prev) => !prev)}
          placeholder='Confirmă parola'
          register={register('passwordConfirm', {
            required: 'Te rugăm să confirmi parola.',
            validate: (value) =>
              value === password.current || 'Parolele nu coincid.'
          })}
          showPassword={showPasswordConfirm}
        />
      </div>

      <AuthSubmitButton loading={loading}>Înregistrează-te</AuthSubmitButton>

      <AuthSwitchCard
        href={`/login${allParams}`}
        icon={<LogIn className='size-5' />}
        text={
          <>
            Ai deja un cont?
            <br />
            Autentifică-te aici.
          </>
        }
      />
    </form>
  );
};
