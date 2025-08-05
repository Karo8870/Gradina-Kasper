import { cn } from '@heroui/react';

export function StepCard({
  content,
  classNames
}: {
  content: string;
  classNames: {
    base: string;
    text: string;
    icon: string;
  };
}) {
  return (
    <div
      className={cn(
        'flex h-56 grow basis-0 items-center gap-6 rounded-[3.75rem] px-10',
        classNames.base
      )}
    >
      <div className='flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white p-5'>
        <i className={cn('text-3xl', classNames.icon, classNames.text)} />
      </div>
      <p className={cn('text-2xl font-medium', classNames.text)}>{content}</p>
    </div>
  );
}
