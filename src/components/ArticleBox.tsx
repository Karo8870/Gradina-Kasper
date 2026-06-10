import Link from 'next/link';
import { Media } from '@/payload-types';
import RenderImage from '@/components/RenderImage';

export function ArticleCard(props: {
  slug: string;
  title: string;
  description: string;
  thumbnail: number | Media | null;
}) {
  return (
    <Link
      href={`/did-you-know/${props.slug}`}
      className='group block rounded-xl border border-neutral-200 bg-white transition-colors'
    >
      <div className='overflow-hidden rounded-t-xl'>
        <RenderImage
          className='aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-110'
          src={props.thumbnail}
        />
      </div>

      <div className='space-y-2 p-4'>
        <h3 className='text-primary-900 line-clamp-2 text-lg font-semibold'>
          {props.title}
        </h3>

        <p className='line-clamp-2 text-sm text-neutral-600'>
          {props.description}
        </p>

        <span className='text-primary-700 text-sm font-medium underline underline-offset-2'>
          Citește articolul
        </span>
      </div>
    </Link>
  );
}
