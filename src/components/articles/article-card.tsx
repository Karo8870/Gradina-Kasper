import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { RenderMedia } from '@/components/render-media';
import type { Article, Media } from '@/payload-types';

export function ArticleCard({ article }: { article: Article }) {
  const thumbnail =
    typeof article.thumbnail === 'object' ? (article.thumbnail as Media) : null;

  return (
    <Link
      className='group bg-card block h-full overflow-hidden rounded-2xl border border-neutral-200 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-neutral-300 focus-visible:outline-2'
      href={`/did-you-know/${article.slug}`}
    >
      <article className='flex h-full flex-col'>
        <div className='bg-muted aspect-[16/10] overflow-hidden'>
          <RenderMedia
            alt={thumbnail?.alt || article.title}
            className='size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]'
            src={thumbnail}
          />
        </div>
        <div className='flex items-start gap-4 p-5 sm:p-6'>
          <div className='min-w-0 flex-1 space-y-3'>
            <h3 className='text-primary-950 text-xl leading-tight font-bold'>
              {article.title}
            </h3>
            <p className='text-muted-foreground line-clamp-2 text-sm leading-relaxed'>
              {article.description}
            </p>
            <span className='text-primary-900 inline-flex text-sm font-semibold underline decoration-neutral-300'>
              Citește articolul
            </span>
          </div>
          <ArrowUpRight className='text-primary mt-1 size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
        </div>
      </article>
    </Link>
  );
}
