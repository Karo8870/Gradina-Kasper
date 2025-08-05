'use client';

import AuthButton from '@/components/buttons/auth-button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from '@/lib/api/auth';
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  phoneNumberValidator
} from '@/lib/validators/profile-validators';
import FormInput from '@/components/forms/form-input';
import FormPasswordInput from '@/components/forms/form-password-input';
import { useRouter } from 'next/navigation';

const schema = z
  .object({
    firstName: nameValidator,
    lastName: nameValidator,
    email: emailValidator,
    phoneNumber: phoneNumberValidator,
    password: passwordValidator,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parolele nu se potrivesc'
  });

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<z.infer<typeof schema>>({
    mode: 'onBlur',
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await signUp(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.phoneNumber
    );

    router.push('/login');
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        error={errors.lastName}
        label='Nume'
        register={register('lastName')}
      />
      <FormInput
        error={errors.firstName}
        label='Prenume'
        register={register('firstName')}
      />
      <FormInput
        error={errors.email}
        label='Email'
        register={register('email')}
      />
      <FormInput
        error={errors.phoneNumber}
        label='Număr de telefon'
        register={register('phoneNumber')}
      />
      <FormPasswordInput
        error={errors.password}
        label='Parolă'
        register={register('password')}
        watch={watch('password')}
      />
      <FormPasswordInput
        error={errors.confirmPassword}
        label='Confirmă parolă'
        register={register('confirmPassword')}
      />
      <AuthButton>Înregistrează-te</AuthButton>
    </form>
  );
}
