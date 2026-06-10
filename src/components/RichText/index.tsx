import { DefaultNodeTypes } from '@payloadcms/richtext-lexical';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks
} from '@payloadcms/richtext-lexical/react';
import { cn } from '@/utilities/cn';

type NodeTypes = DefaultNodeTypes;

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters
}) => ({
  ...defaultConverters,
  heading({ node, nodesToJSX }) {
    const content = nodesToJSX({ nodes: node.children }).join('');

    if (node.tag === 'h1') {
      return (
        <h1 className='text-primary-900 text-4xl font-bold tracking-tight md:text-5xl'>
          {content}
        </h1>
      );
    }

    if (node.tag === 'h2') {
      return (
        <h2 className='text-primary-900 !mt-4 !mb-3 text-2xl font-bold tracking-tight md:text-3xl'>
          {content}
        </h2>
      );
    }

    const Tag = node.tag;

    return <Tag>{content}</Tag>;
  }
});

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const RichText: React.FC<Props> = (props) => {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          'container ': enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert ': enableProse
        },
        className
      )}
      {...rest}
    />
  );
};
