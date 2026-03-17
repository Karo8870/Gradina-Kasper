'use client';

import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type FormPasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
};

export default function FormPasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error
}: FormPasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className='text-sm font-medium text-primary-900'>
        {label}
      </label>

      <div className='relative'>
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className='bg-zinc-50 pr-11'
          placeholder={label}
        />

        <button
          type='button'
          aria-label={isVisible ? 'Ascunde parola' : 'Arată parola'}
          className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center transition-colors'
          onClick={() => setIsVisible((value) => !value)}
        >
          {isVisible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
        </button>
      </div>

      {error ? <p className='text-xs text-red-700'>{error}</p> : null}
    </div>
  );
}