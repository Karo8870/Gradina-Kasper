import { Button } from '@/components/ui/button';
import React from 'react';

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  loading: boolean;
  disabled?: boolean;
};

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  children,
  loading,
  disabled = false
}) => {
  return (
    <Button
      className='bg-primary-600 hover:bg-primary-700 mt-7 h-14 w-full rounded-[20px] text-base font-semibold text-white'
      disabled={loading || disabled}
      type='submit'
      variant='default'
    >
      {loading ? 'Procesare' : children}
    </Button>
  );
};
