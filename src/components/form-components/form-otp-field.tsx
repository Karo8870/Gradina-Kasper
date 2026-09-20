'use client';

import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

export function FormOTPField<T extends FieldValues>({
  autoFocus,
  control,
  error,
  label,
  name
}: {
  autoFocus?: boolean;
  control: Control<T>;
  error?: FieldError;
  label: string;
  name: Path<T>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const id = field.name;

        return (
          <div className='flex flex-col gap-2'>
            <Label htmlFor={id}>{label}</Label>
            <InputOTP
              aria-describedby={error ? `${id}-error` : undefined}
              aria-invalid={Boolean(error)}
              autoFocus={autoFocus}
              id={id}
              maxLength={6}
              onBlur={field.onBlur}
              onChange={field.onChange}
              pattern={REGEXP_ONLY_DIGITS}
              value={field.value ?? ''}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot index={index} key={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error?.message ? (
              <p className='text-destructive !m-0 text-sm' id={`${id}-error`}>
                {error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
