import { RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { HTMLAttributes } from 'react';
import { jsxConverter } from '@/components/rich-text/jsx-converter';

type Props = {
  data: SerializedEditorState;
} & HTMLAttributes<HTMLDivElement>;

export function RichTextRenderer(props: Props) {
  const { className, ...rest } = props;

  return (
    <RichTextConverter
      {...rest}
      className={className}
      converters={jsxConverter}
    />
  );
}
