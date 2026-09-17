import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type FormStatusKind = 'error' | 'message' | 'success' | 'warning';

const statusConfig = {
  error: {
    icon: CircleAlert,
    title: 'Eroare',
    className: 'border-destructive/40'
  },
  message: {
    icon: Info,
    title: 'Informare',
    className: ''
  },
  success: {
    icon: CircleCheck,
    title: 'Succes',
    className: 'border-emerald-600/40 text-emerald-700 dark:text-emerald-400'
  },
  warning: {
    icon: TriangleAlert,
    title: 'Atentie',
    className: 'border-amber-500/40 text-amber-700 dark:text-amber-300'
  }
} satisfies Record<
  FormStatusKind,
  { className: string; icon: typeof CircleAlert; title: string }
>;

export function FormStatus({
  children,
  kind
}: {
  children: ReactNode;
  kind: FormStatusKind;
}) {
  const { className, icon: Icon, title } = statusConfig[kind];

  return (
    <Alert
      className={className}
      variant={kind === 'error' ? 'destructive' : 'default'}
    >
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
