import { LoaderCircle } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type FormSubmitButtonProps = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  'children' | 'type'
> & {
  children: ReactNode;
  isSubmitting: boolean;
  pendingLabel?: string;
};

export function FormSubmitButton({
  children,
  isSubmitting,
  pendingLabel = 'Se proceseaza...',
  ...buttonProps
}: FormSubmitButtonProps) {
  return (
    <Button disabled={isSubmitting} type='submit' {...buttonProps}>
      {isSubmitting ? <LoaderCircle className='animate-spin' /> : null}
      {isSubmitting ? pendingLabel : children}
    </Button>
  );
}
