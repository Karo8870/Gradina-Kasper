import { DefaultNodeTypes } from '@payloadcms/richtext-lexical';
import { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';

type NodeTypes = DefaultNodeTypes;

export const jsxConverter: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters
}) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const text = nodesToJSX({ nodes: node.children });

    if (node.tag === 'h1') {
      const id = text
        .join('')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      return (
        <h1
          id={id}
          className='mt-4 mb-1 scroll-mt-24 text-2xl font-bold tracking-tight text-neutral-900 first:mt-0 lg:text-3xl'
        >
          {text}
        </h1>
      );
    }

    if (node.tag === 'h2') {
      return (
        <h2 className='mt-3 mb-1 scroll-mt-24 text-xl font-semibold tracking-tight text-neutral-800 first:mt-0 lg:text-2xl'>
          {text}
        </h2>
      );
    }

    if (node.tag === 'h3') {
      return (
        <h3 className='mt-2 mb-1 scroll-mt-24 font-semibold tracking-tight text-neutral-800 lg:text-xl'>
          {text}
        </h3>
      );
    }
  },
  paragraph: ({ node, nodesToJSX, converters }) => {
    return (
      <p className='mb-4 text-base leading-7 text-neutral-700'>
        {nodesToJSX({ nodes: node.children, converters })}
      </p>
    );
  }
});
