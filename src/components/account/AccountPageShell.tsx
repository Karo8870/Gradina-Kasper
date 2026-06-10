import React from 'react';

type Props = {
  action?: React.ReactNode;
  children: React.ReactNode;
  description?: React.ReactNode;
  title: string;
};

export const AccountPageShell: React.FC<Props> = ({
  action,
  children,
  description,
  title
}) => {
  return (
    <section className='rounded-[2rem] bg-white p-6 shadow-[0_0_35px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-8'>
      <div className='mb-8 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-tight text-primary-900'>
            {title}
          </h1>
          {description ? (
            <p className='mt-3 text-sm leading-7 text-neutral-700'>
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className='shrink-0'>{action}</div> : null}
      </div>

      {children}
    </section>
  );
};
