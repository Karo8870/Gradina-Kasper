'use client';

import { Button } from '@/components/ui/button';
import FormInput from '@/components/forms/form-input';
import FormPasswordInput from '@/components/forms/form-password-input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Completează emailul și parola.');
      return;
    }

    setError('');
    router.push('/profile');
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={onSubmit}>
      <FormInput
        id='login-email'
        label='Email'
        type='email'
        autoComplete='email'
        value={email}
        onChange={setEmail}
      />

      <FormPasswordInput
        id='login-password'
        label='Parolă'
        autoComplete='current-password'
        value={password}
        onChange={setPassword}
      />

      {error ? <p className='text-xs text-red-700'>{error}</p> : null}

      <Button
        type='submit'
        className='h-11 rounded-2xl bg-primary-900 text-base font-semibold text-white hover:bg-primary-800'
      >
        Autentifică-te
      </Button>
    </form>
  );
}