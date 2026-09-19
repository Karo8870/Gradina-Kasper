'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  changePasswordAction,
  setPasswordAction
} from '@/actions/account-security';
import {
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import { withFeedback } from '@/features/auth/utils';

import { passwordSchema } from '../auth/shared';

const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Confirmă parola.')
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: 'Parolele nu coincid.',
    path: ['passwordConfirm']
  });

const changePasswordSchema = passwordConfirmationSchema.extend({
  currentPassword: z.string().min(1, 'Parola curentă este obligatorie.')
});

type PasswordSetupValues = z.infer<typeof passwordConfirmationSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function PasswordSetupForm() {
  const router = useRouter();
  const form = useForm<PasswordSetupValues>({
    defaultValues: { password: '', passwordConfirm: '' },
    resolver: zodResolver(passwordConfirmationSchema)
  });

  async function onSubmit(values: PasswordSetupValues) {
    const result = await setPasswordAction(values).catch(() => ({
      success: false
    }));

    router.replace(
      withFeedback(
        '/account/security',
        result.success ? 'success' : 'error',
        result.success
          ? 'Parola a fost configurată.'
          : 'Parola nu a putut fi configurată.'
      )
    );
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.password}
        label='Parolă nouă'
        registration={form.register('password')}
      />
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.passwordConfirm}
        label='Confirmă parola nouă'
        registration={form.register('passwordConfirm')}
      />
      <FormSubmitButton
        isSubmitting={form.formState.isSubmitting}
        pendingLabel='Se configurează parola...'
      >
        Configurează parola
      </FormSubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const form = useForm<ChangePasswordValues>({
    defaultValues: { currentPassword: '', password: '', passwordConfirm: '' },
    resolver: zodResolver(changePasswordSchema)
  });

  async function onSubmit(values: ChangePasswordValues) {
    const result = await changePasswordAction(values).catch(() => ({
      success: false
    }));

    router.replace(
      withFeedback(
        '/account/security',
        result.success ? 'success' : 'error',
        result.success
          ? 'Parola a fost actualizată. Celelalte sesiuni au fost deconectate.'
          : 'Parola nu a putut fi actualizată. Verifică parola curentă.'
      )
    );
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormPasswordField
        autoComplete='current-password'
        error={form.formState.errors.currentPassword}
        label='Parola curentă'
        registration={form.register('currentPassword')}
      />
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.password}
        label='Parolă nouă'
        registration={form.register('password')}
      />
      <FormPasswordField
        autoComplete='new-password'
        error={form.formState.errors.passwordConfirm}
        label='Confirmă parola nouă'
        registration={form.register('passwordConfirm')}
      />
      <FormSubmitButton
        isSubmitting={form.formState.isSubmitting}
        pendingLabel='Se actualizează parola...'
      >
        Actualizează parola
      </FormSubmitButton>
    </form>
  );
}
