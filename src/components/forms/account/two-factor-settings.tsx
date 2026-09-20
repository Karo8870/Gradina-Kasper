'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Download, ShieldCheck, ShieldOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  disableTwoFactorAction,
  enableTwoFactorAction,
  regenerateBackupCodesAction,
  verifyTOTPEnrollmentAction
} from '@/actions/two-factor';
import {
  FormCheckboxField,
  FormOTPField,
  FormPasswordField,
  FormSubmitButton
} from '@/components/form-components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { withFeedback } from '@/features/auth/utils';
import type { TwoFactorMode } from '@/lib/auth/two-factor/config';

const passwordSchema = z.object({
  password: z.string().min(1, 'Parola este obligatorie.')
});

const totpVerificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Introdu codul format din 6 cifre.')
});

const backupAcknowledgementSchema = z.object({
  acknowledged: z.boolean().refine(Boolean, {
    message: 'Confirmă că ai salvat codurile de rezervă.'
  })
});

type PasswordValues = z.infer<typeof passwordSchema>;
type TOTPVerificationValues = z.infer<typeof totpVerificationSchema>;
type BackupAcknowledgementValues = z.infer<typeof backupAcknowledgementSchema>;

type TOTPSetup = {
  backupCodes: string[];
  totpURI: string;
  verified: boolean;
};

function BackupCodes({
  codes,
  onDone
}: {
  codes: string[];
  onDone?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const form = useForm<BackupAcknowledgementValues>({
    defaultValues: { acknowledged: false },
    resolver: zodResolver(backupAcknowledgementSchema)
  });
  const content = codes.join('\n');

  async function copyCodes() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
  }

  function downloadCodes() {
    const url = URL.createObjectURL(
      new Blob([content], { type: 'text/plain;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coduri-rezerva.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm'>
        Salvează aceste coduri într-un loc sigur. Fiecare poate fi folosit o
        singură dată.
      </p>
      <div className='grid grid-cols-2 gap-2 rounded-md border p-4 font-mono text-sm'>
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className='flex flex-wrap gap-2'>
        <Button onClick={copyCodes} type='button' variant='outline'>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copiate' : 'Copiază'}
        </Button>
        <Button onClick={downloadCodes} type='button' variant='outline'>
          <Download />
          Descarcă
        </Button>
      </div>
      {onDone ? (
        <form
          className='flex flex-col gap-4'
          onSubmit={form.handleSubmit(onDone)}
        >
          <FormCheckboxField
            control={form.control}
            label='Am salvat codurile de rezervă'
            name='acknowledged'
          />
          {form.formState.errors.acknowledged?.message ? (
            <p className='text-destructive text-sm'>
              {form.formState.errors.acknowledged.message}
            </p>
          ) : null}
          <Button type='submit'>Finalizează configurarea</Button>
        </form>
      ) : null}
    </div>
  );
}

export function TwoFactorSettings({
  enabled,
  hasPassword,
  mode
}: {
  enabled: boolean;
  hasPassword: boolean;
  mode: Exclude<TwoFactorMode, 'none'>;
}) {
  const router = useRouter();
  const enableForm = useForm<PasswordValues>({
    defaultValues: { password: '' },
    resolver: zodResolver(passwordSchema)
  });
  const verifyForm = useForm<TOTPVerificationValues>({
    defaultValues: { code: '' },
    resolver: zodResolver(totpVerificationSchema)
  });
  const disableForm = useForm<PasswordValues>({
    defaultValues: { password: '' },
    resolver: zodResolver(passwordSchema)
  });
  const recoveryForm = useForm<PasswordValues>({
    defaultValues: { password: '' },
    resolver: zodResolver(passwordSchema)
  });
  const [setup, setSetup] = useState<TOTPSetup>();
  const [regeneratedCodes, setRegeneratedCodes] = useState<string[]>();

  function showFeedback(
    success: boolean,
    successMessage: string,
    errorMessage: string
  ) {
    router.replace(
      withFeedback(
        '/account/security',
        success ? 'success' : 'error',
        success ? successMessage : errorMessage
      )
    );
    router.refresh();
  }

  async function enable(values: PasswordValues) {
    const result = await enableTwoFactorAction(values).catch(() => ({
      success: false as const
    }));

    if (!result.success) {
      enableForm.setError('password', {
        message: 'Parola este incorectă sau metoda nu a putut fi activată.'
      });
      return;
    }

    if (result.mode === 'totp') {
      setSetup({ ...result, verified: false });
      enableForm.reset();
      return;
    }

    showFeedback(true, 'Autentificarea în doi pași a fost activată.', '');
  }

  async function verifyEnrollment(values: TOTPVerificationValues) {
    const result = await verifyTOTPEnrollmentAction(values).catch(() => ({
      success: false
    }));

    if (!result.success) {
      verifyForm.setError('code', {
        message:
          'Codul este invalid. Verifică ora dispozitivului și încearcă din nou.'
      });
      return;
    }

    setSetup((current) => (current ? { ...current, verified: true } : current));
  }

  async function disable(values: PasswordValues) {
    const result = await disableTwoFactorAction(values).catch(() => ({
      success: false
    }));

    if (!result.success) {
      disableForm.setError('password', {
        message: 'Parola este incorectă.'
      });
      return;
    }

    showFeedback(true, 'Autentificarea în doi pași a fost dezactivată.', '');
  }

  async function regenerate(values: PasswordValues) {
    const result = await regenerateBackupCodesAction(values).catch(() => ({
      success: false as const
    }));

    if (!result.success) {
      recoveryForm.setError('password', {
        message: 'Parola este incorectă.'
      });
      return;
    }

    setRegeneratedCodes(result.backupCodes);
    recoveryForm.reset();
  }

  function finishSetup() {
    showFeedback(true, 'Autentificarea în doi pași a fost activată.', '');
  }

  const secret = setup
    ? new URL(setup.totpURI).searchParams.get('secret')
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autentificare în doi pași</CardTitle>
        <CardDescription>
          {mode === 'totp'
            ? 'Protejează contul cu o aplicație de autentificare.'
            : 'Protejează contul cu un cod trimis prin email.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-center gap-3'>
          {enabled ? <ShieldCheck /> : <ShieldOff />}
          <div>
            <p className='font-medium'>
              {enabled ? 'Activată' : 'Dezactivată'}
            </p>
            <p className='text-muted-foreground text-sm'>
              {mode === 'totp' ? 'Aplicație TOTP' : 'Cod prin email'}
            </p>
          </div>
        </div>

        {!hasPassword ? (
          <p className='border-t pt-5 text-sm'>
            Configurează mai întâi o parolă pentru a putea gestiona
            autentificarea în doi pași.
          </p>
        ) : null}

        {hasPassword && !enabled && !setup ? (
          <form
            className='flex flex-col gap-4 border-t pt-5'
            onSubmit={enableForm.handleSubmit(enable)}
          >
            <FormPasswordField
              autoComplete='current-password'
              error={enableForm.formState.errors.password}
              label='Parola curentă'
              registration={enableForm.register('password')}
            />
            <FormSubmitButton
              isSubmitting={enableForm.formState.isSubmitting}
              pendingLabel='Se activează...'
            >
              Activează
            </FormSubmitButton>
          </form>
        ) : null}

        {setup && !setup.verified ? (
          <div className='flex flex-col gap-5 border-t pt-5'>
            <p className='text-sm'>
              Scanează codul cu aplicația de autentificare, apoi introdu codul
              generat pentru confirmare.
            </p>
            <div className='w-fit rounded-md border bg-white p-3'>
              <QRCodeSVG size={180} value={setup.totpURI} />
            </div>
            {secret ? (
              <p className='text-sm break-all'>
                Cheie pentru configurare manuală:{' '}
                <span className='font-mono'>{secret}</span>
              </p>
            ) : null}
            <form
              className='flex flex-col gap-4'
              onSubmit={verifyForm.handleSubmit(verifyEnrollment)}
            >
              <FormOTPField
                control={verifyForm.control}
                error={verifyForm.formState.errors.code}
                label='Cod de verificare'
                name='code'
              />
              <FormSubmitButton
                isSubmitting={verifyForm.formState.isSubmitting}
                pendingLabel='Se verifică...'
              >
                Verifică și activează
              </FormSubmitButton>
            </form>
          </div>
        ) : null}

        {setup?.verified ? (
          <div className='border-t pt-5'>
            <BackupCodes codes={setup.backupCodes} onDone={finishSetup} />
          </div>
        ) : null}

        {hasPassword && enabled ? (
          <form
            className='flex flex-col gap-4 border-t pt-5'
            onSubmit={disableForm.handleSubmit(disable)}
          >
            <p className='text-sm'>
              Pentru dezactivare, confirmă parola curentă.
            </p>
            <FormPasswordField
              autoComplete='current-password'
              error={disableForm.formState.errors.password}
              label='Parola curentă'
              registration={disableForm.register('password')}
            />
            <FormSubmitButton
              isSubmitting={disableForm.formState.isSubmitting}
              pendingLabel='Se dezactivează...'
              variant='destructive'
            >
              Dezactivează
            </FormSubmitButton>
          </form>
        ) : null}

        {hasPassword && enabled && mode === 'totp' ? (
          <div className='flex flex-col gap-4 border-t pt-5'>
            <p className='font-medium'>Coduri de rezervă</p>
            {regeneratedCodes ? (
              <BackupCodes codes={regeneratedCodes} />
            ) : (
              <form
                className='flex flex-col gap-4'
                onSubmit={recoveryForm.handleSubmit(regenerate)}
              >
                <p className='text-sm'>
                  Regenerarea invalidează toate codurile de rezervă anterioare.
                </p>
                <FormPasswordField
                  autoComplete='current-password'
                  error={recoveryForm.formState.errors.password}
                  label='Parola curentă'
                  registration={recoveryForm.register('password')}
                />
                <FormSubmitButton
                  isSubmitting={recoveryForm.formState.isSubmitting}
                  pendingLabel='Se generează...'
                  variant='outline'
                >
                  Generează coduri noi
                </FormSubmitButton>
              </form>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
