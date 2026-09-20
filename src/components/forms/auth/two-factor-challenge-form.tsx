'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  sendTwoFactorOTPAction,
  verifyTwoFactorAction
} from '@/actions/two-factor';
import {
  FormCheckboxField,
  FormField,
  FormOTPField,
  FormStatus,
  FormSubmitButton
} from '@/components/form-components';
import { Button } from '@/components/ui/button';
import { safeInternalRedirect } from '@/features/auth/utils';
import type { TwoFactorMode } from '@/lib/auth/two-factor/config';

const challengeSchema = z.object({
  code: z
    .string()
    .refine(
      (value) =>
        /^\d{6}$/.test(value) || /^[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(value),
      'Introdu un cod valid.'
    ),
  trustDevice: z.boolean()
});

type ChallengeValues = z.infer<typeof challengeSchema>;

export function TwoFactorChallengeForm({
  mode
}: {
  mode: Exclude<TwoFactorMode, 'none'>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination =
    safeInternalRedirect(searchParams.get('redirect')) ?? '/account';
  const form = useForm<ChallengeValues>({
    defaultValues: { code: '', trustDevice: false },
    resolver: zodResolver(challengeSchema)
  });
  const sentInitialCode = useRef(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [sendStatus, setSendStatus] = useState<'error' | 'sent'>();
  const [cooldown, setCooldown] = useState(0);
  const [isSending, startSending] = useTransition();

  useEffect(() => {
    if (mode !== 'otp' || sentInitialCode.current) return;

    sentInitialCode.current = true;
    startSending(async () => {
      const result = await sendTwoFactorOTPAction().catch(() => ({
        success: false
      }));

      setSendStatus(result.success ? 'sent' : 'error');
      if (result.success) setCooldown(60);
    });
  }, [mode]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1000
    );

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function resendCode() {
    if (cooldown > 0 || isSending) return;

    startSending(async () => {
      const result = await sendTwoFactorOTPAction().catch(() => ({
        success: false
      }));

      setSendStatus(result.success ? 'sent' : 'error');
      if (result.success) setCooldown(60);
    });
  }

  async function onSubmit(values: ChallengeValues) {
    const method = useBackupCode ? 'backup' : mode;
    const result = await verifyTwoFactorAction({
      ...values,
      code: values.code.trim(),
      method
    }).catch(() => ({ success: false }));

    if (!result.success) {
      form.setError('code', {
        message:
          'Codul este invalid sau a expirat. Verifică-l și încearcă din nou.'
      });
      return;
    }

    router.replace(destination);
    router.refresh();
  }

  function toggleBackupCode() {
    setUseBackupCode((current) => !current);
    form.resetField('code');
  }

  return (
    <form
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {mode === 'otp' && sendStatus === 'sent' ? (
        <FormStatus kind='success'>
          Am trimis codul la adresa de email a contului.
        </FormStatus>
      ) : null}
      {mode === 'otp' && sendStatus === 'error' ? (
        <FormStatus kind='error'>
          Codul nu a putut fi trimis. Încearcă din nou.
        </FormStatus>
      ) : null}

      {useBackupCode ? (
        <FormField
          autoComplete='one-time-code'
          error={form.formState.errors.code}
          label='Cod de rezervă'
          registration={form.register('code')}
        />
      ) : (
        <FormOTPField
          autoFocus
          control={form.control}
          error={form.formState.errors.code}
          label={
            mode === 'otp' ? 'Codul primit prin email' : 'Codul din aplicație'
          }
          name='code'
        />
      )}

      <FormCheckboxField
        control={form.control}
        label='Ai încredere în acest dispozitiv timp de 30 de zile'
        name='trustDevice'
      />

      <FormSubmitButton
        isSubmitting={form.formState.isSubmitting}
        pendingLabel='Se verifică...'
      >
        Confirmă autentificarea
      </FormSubmitButton>

      {mode === 'otp' ? (
        <Button
          disabled={isSending || cooldown > 0}
          onClick={resendCode}
          type='button'
          variant='outline'
        >
          {isSending ? <LoaderCircle className='animate-spin' /> : null}
          {cooldown > 0 ? `Retrimite codul în ${cooldown}s` : 'Retrimite codul'}
        </Button>
      ) : (
        <Button onClick={toggleBackupCode} type='button' variant='ghost'>
          {useBackupCode
            ? 'Folosește codul din aplicație'
            : 'Folosește un cod de rezervă'}
        </Button>
      )}
    </form>
  );
}
