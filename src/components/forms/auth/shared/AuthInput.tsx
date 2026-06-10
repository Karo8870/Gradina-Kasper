import { FormError } from '@/components/forms/FormError';
import { FormItem } from '@/components/forms/FormItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import React from 'react';

type AuthInputProps = {
  error?: FieldError;
  label: string;
  name: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  type?: React.HTMLInputTypeAttribute;
};

export const AuthInput: React.FC<AuthInputProps> = ({
  error,
  label,
  name,
  placeholder,
  register,
  type = 'text'
}) => {
  return (
    <FormItem className='gap-2'>
      <Label
        htmlFor={name}
        className='!text-base font-semibold text-neutral-900'
      >
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className='h-14 rounded-2xl border-0 bg-neutral-100 px-4 text-base text-neutral-800 shadow-none placeholder:text-neutral-500'
        {...register}
      />
      {error && <FormError message={error.message} />}
    </FormItem>
  );
};
