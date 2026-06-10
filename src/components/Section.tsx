import { ComponentProps, ReactNode } from 'react';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { RichText } from '@/components/RichText';
import { cn } from '@/utilities/cn';

export default function Section({
  title,
  description,
  children,
  ...props
}: {
  title: string;
  description: SerializedEditorState;
  children: ReactNode;
} & ComponentProps<'section'>) {
  const { className, ...otherProps } = props;

  return (
    <section
      className={cn('px-4 md:px-6 lg:px-24 pb-12', className)}
      {...otherProps}
    >
      <h1 className='text-primary-900 text-3xl font-bold md:text-4xl'>
        {title}
      </h1>
      <RichText
        className='pb-8 !px-0 !mx-0 text-neutral-700'
        data={description}
      />
      {children}
    </section>
  );
}
