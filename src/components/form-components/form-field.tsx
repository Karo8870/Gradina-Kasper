import type { ComponentPropsWithoutRef } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormFieldProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'id'> & {
  error?: FieldError;
  label: string;
  registration: UseFormRegisterReturn;
};

export function FormField({
  error,
  label,
  registration,
  ...inputProps
}: FormFieldProps) {
  const id = inputProps.name ?? registration.name;

  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        {...registration}
        {...inputProps}
      />
      {error?.message ? (
        <p className='text-destructive !m-0 text-sm' id={`${id}-error`}>
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
