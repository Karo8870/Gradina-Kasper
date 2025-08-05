import { cn } from '@heroui/react';

export default function MobileStepCard({
  icon,
  content
}: {
  content: string;
  icon: string;
}) {
  return (
    <div className='flex items-center gap-4 rounded-[1.25rem] bg-secondary-200/30 p-4'>
      <i className={cn(icon, 'text-3xl text-primary-900')} />
      <label className='text-base font-medium text-primary-900'>
        {content}
      </label>
    </div>
  );
}
