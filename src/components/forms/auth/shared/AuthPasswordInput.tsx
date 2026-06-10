import { FormError } from '@/components/forms/FormError';
import { FormItem } from '@/components/forms/FormItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import React from 'react';

type AuthPasswordInputProps = {
  error?: FieldError;
  label: string;
  name: string;
  onToggle: () => void;
  placeholder: string;
  register: UseFormRegisterReturn;
  showPassword: boolean;
};

export const AuthPasswordInput: React.FC<AuthPasswordInputProps> = ({
  error,
  label,
  name,
  onToggle,
  placeholder,
  register,
  showPassword
}) => {
  return (
    <FormItem className='gap-2'>
      <Label
        htmlFor={name}
        className='!text-base font-semibold text-neutral-900'
      >
        {label}
      </Label>
      <div className='relative'>
        <Input
          id={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className='h-14 rounded-2xl border-0 bg-neutral-100 px-4 pr-12 text-base text-neutral-800 shadow-none placeholder:text-neutral-500'
          {...register}
        />
        <button
          type='button'
          className='absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 hover:text-neutral-700'
          onClick={onToggle}
          aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
        >
          {showPassword ? (
            <Eye className='size-5' />
          ) : (
            <EyeOff className='size-5' />
          )}
        </button>
      </div>
      {error && <FormError message={error.message} />}
    </FormItem>
  );
};
