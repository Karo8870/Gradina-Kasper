'use client';

import { Button } from '@/components/ui/button';
import FormInput from '@/components/forms/form-input';
import FormPasswordInput from '@/components/forms/form-password-input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {
      setError('Completează toate câmpurile.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele nu se potrivesc.');
      return;
    }

    setError('');
    router.push('/login');
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={onSubmit}>
      <FormInput
        id='register-last-name'
        label='Nume'
        autoComplete='family-name'
        value={lastName}
        onChange={setLastName}
      />

      <FormInput
        id='register-first-name'
        label='Prenume'
        autoComplete='given-name'
        value={firstName}
        onChange={setFirstName}
      />

      <FormInput
        id='register-email'
        label='Email'
        type='email'
        autoComplete='email'
        value={email}
        onChange={setEmail}
      />

      <FormInput
        id='register-phone-number'
        label='Număr de telefon'
        autoComplete='tel'
        value={phoneNumber}
        onChange={setPhoneNumber}
      />

      <FormPasswordInput
        id='register-password'
        label='Parolă'
        autoComplete='new-password'
        value={password}
        onChange={setPassword}
      />

      <FormPasswordInput
        id='register-confirm-password'
        label='Confirmă parolă'
        autoComplete='new-password'
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      {error ? <p className='text-xs text-red-700'>{error}</p> : null}

      <Button
        type='submit'
        className='h-11 rounded-2xl bg-primary-900 text-base font-semibold text-white hover:bg-primary-800'
      >
        Înregistrează-te
      </Button>
    </form>
  );
}