import { ImgHTMLAttributes } from 'react';
import { Media } from '@/payload-types';

export default function (
  props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src: number | Media | null | undefined;
  }
) {
  if (
    props.src === null ||
    props.src === undefined ||
    typeof props.src === 'number' ||
    !props.src.url
  ) {
    return <></>;
  }

  return <img {...props} src={props.src.url} alt={props.alt} />;
}
