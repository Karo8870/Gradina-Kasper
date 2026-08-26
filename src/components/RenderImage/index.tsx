import { ImgHTMLAttributes } from 'react';
import { Media } from '@/payload-types';

export default function (
  props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src: number | Media | null | undefined;
    fallbackSrc?: string;
  }
) {
  const { fallbackSrc, src, ...imageProps } = props;
  const resolvedSrc =
    src && typeof src === 'object' && src.url ? src.url : fallbackSrc;

  if (!resolvedSrc) {
    return <></>;
  }

  return <img {...imageProps} src={resolvedSrc} alt={imageProps.alt} />;
}
