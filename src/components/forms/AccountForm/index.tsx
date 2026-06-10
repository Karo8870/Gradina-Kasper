'use client';

import { AuthPasswordInput } from '@/components/forms/auth/shared/AuthPasswordInput';
import { AuthSubmitButton } from '@/components/forms/auth/shared/AuthSubmitButton';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/Auth';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormData = {
  password: string;
  passwordConfirm: string;
};

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      passwordConfirm: ''
    }
  });

  const password = useRef({});
  password.current = watch('password', '');

  const router = useRouter();

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`,
        {
          body: JSON.stringify({
            password: data.password
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'PATCH'
        }
      );

      if (response.ok) {
        const json = await response.json();
        setUser(json.doc);
        toast.success('Parola a fost schimbată cu succes.');
        reset({
          password: '',
          passwordConfirm: ''
        });
        return;
      }

      toast.error('A apărut o problemă la schimbarea parolei.');
    },
    [user, setUser, reset]
  );

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'Trebuie să fii autentificat pentru a vedea această pagină.'
        )}&redirect=${encodeURIComponent('/account')}`
      );
    }
  }, [user, router]);

  return (
    <div className='max-w-xl'>
      <div className='mb-8 rounded-2xl border border-neutral-200 bg-white p-5'>
        <Label className='!text-base font-semibold text-neutral-900'>
          Adresă de email
        </Label>
        <p className='mt-2 text-sm font-medium text-neutral-700'>
          {user?.email}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='mb-8 max-w-none'>
          <p className='text-sm leading-7 text-neutral-700'>
            Poți schimba parola contului mai jos.
          </p>
        </div>

        <div className='mb-8 flex flex-col gap-5'>
          <AuthPasswordInput
            error={errors.password}
            label='Parolă nouă'
            name='password'
            onToggle={() => setShowPassword((prev) => !prev)}
            placeholder='Parolă nouă'
            register={register('password', {
              required: 'Te rugăm să introduci o parolă nouă.'
            })}
            showPassword={showPassword}
          />

          <AuthPasswordInput
            error={errors.passwordConfirm}
            label='Confirmă parola'
            name='passwordConfirm'
            onToggle={() => setShowPasswordConfirm((prev) => !prev)}
            placeholder='Confirmă parola'
            register={register('passwordConfirm', {
              required: 'Te rugăm să confirmi noua parolă.',
              validate: (value) =>
                value === password.current || 'Parolele nu coincid.'
            })}
            showPassword={showPasswordConfirm}
          />
        </div>

        <AuthSubmitButton
          disabled={!isDirty}
          loading={isLoading || isSubmitting}
        >
          Schimbă parola
        </AuthSubmitButton>
      </form>
    </div>
  );
};
