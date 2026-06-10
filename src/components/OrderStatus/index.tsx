import { OrderStatus as StatusOptions } from '@/payload-types';
import { cn } from '@/utilities/cn';

type Props = {
  status: StatusOptions;
  className?: string;
};

export const OrderStatus: React.FC<Props> = ({ status, className }) => {
  const label = {
    processing: 'Comandă primită',
    completed: 'Finalizată',
    cancelled: 'Anulată',
    refunded: 'Rambursată'
  }[status || 'processing'];

  return (
    <div
      className={cn(
        'text-xs tracking-widest font-mono uppercase py-0 px-2 rounded w-fit',
        className,
        {
          'bg-primary/10': status === 'processing',
          'bg-success': status === 'completed',
          'bg-neutral-100':
            status === 'cancelled' || status === 'refunded'
        }
      )}
    >
      {label}
    </div>
  );
};
