import { RichText } from '@payloadcms/richtext-lexical/react';
import type { ComponentProps } from 'react';
import { cn } from 'cn';

type CmsRichTextProps = Omit<ComponentProps<typeof RichText>, 'data'> & {
  data?: ComponentProps<typeof RichText>['data'] | null;
};

export function CmsRichText({ className, data, ...props }: CmsRichTextProps) {
  if (!data) return null;

  return (
    <RichText
      className={cn(
        'text-muted-foreground space-y-4 leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
        className
      )}
      data={data}
      {...props}
    />
  );
}
