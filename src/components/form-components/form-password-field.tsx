'use client';

import { Eye, EyeOff } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormPasswordFieldProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  'id' | 'type'
> & {
  error?: FieldError;
  label: string;
  registration: UseFormRegisterReturn;
};

export function FormPasswordField({
  error,
  label,
  registration,
  ...inputProps
}: FormPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = inputProps.name ?? registration.name;

  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <Input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className='pr-10'
          id={id}
          type={visible ? 'text' : 'password'}
          {...registration}
          {...inputProps}
        />
        <Button
          aria-label={visible ? 'Ascunde parola' : 'Arată parola'}
          className='absolute top-0 right-0'
          onClick={() => setVisible((current) => !current)}
          size='icon'
          type='button'
          variant='ghost'
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error?.message ? (
        <p className='text-destructive !m-0 text-sm' id={`${id}-error`}>
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
