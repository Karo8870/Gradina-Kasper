'use client';

import { z } from 'zod';
import AuthButton from '@/components/buttons/auth-button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import { initFirebaseApp } from '../../../firebase.config';
import { login } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import {
  emailValidator,
  passwordValidator
} from '@/lib/validators/profile-validators';
import FormInput from '@/components/forms/form-input';
import FormPasswordInput from '@/components/forms/form-password-input';

const schema = z.object({
  email: emailValidator,
  password: passwordValidator
});

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<z.infer<typeof schema>>({
    mode: 'onBlur',
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const user = await signInWithEmailAndPassword(
      getAuth(initFirebaseApp()),
      data.email,
      data.password
    );

    await login(await user.user.getIdToken());

    router.push('/');
  };

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={handleSubmit(onSubmit as any)}
    >
      <FormInput
        error={errors.email}
        label='Email'
        register={register('email')}
      />
      <FormPasswordInput
        error={errors.password}
        label={'Parolă'}
        register={register('password')}
      />
      <AuthButton>Autentifică-te</AuthButton>
    </form>
  );
}
