import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Media } from '@/payload-types';

type HeroBlockData = {
  title?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  desktopImage?: unknown;
  mobileImage?: unknown;
};

function toMedia(value: unknown): Media | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Media;
}

export function HomeHeroBlock({ block }: { block: HeroBlockData }) {
  const desktopMedia = toMedia(block.desktopImage) ?? toMedia(block.mobileImage);
  const mobileMedia = toMedia(block.mobileImage) ?? desktopMedia;

  const desktopBackground = desktopMedia?.url
    ? { backgroundImage: `url(${desktopMedia.url})` }
    : undefined;

  const title = block.title ?? 'Bine ati venit la Gradina Kasper!';
  const description = block.description ?? '';
  const ctaLabel = block.ctaLabel ?? 'Comanda acum';

  return (
    <section className='flex h-auto flex-col gap-7 pb-0 sm:h-[calc(100vh-79px)] sm:pb-7'>
      <div
        style={desktopBackground}
        className={cn(
          'hidden grow rounded-[3.75rem] bg-cover bg-center lg:block',
          !desktopMedia?.url && 'bg-secondary-50'
        )}
      >
        <div
          className={cn(
            'flex h-full flex-col justify-center rounded-[3.75rem] px-12 py-6',
            desktopMedia?.url
              ? 'bg-gradient-to-r from-[#FFFFFFE6] via-[#FFFFFFA3] to-[#D9D9D900]'
              : 'bg-gradient-to-r from-white/90 via-white/80 to-white/60'
          )}
        >
          <div className='flex max-w-[44rem] flex-col items-start'>
            <h1 className='pb-8 text-[4rem] leading-tight font-bold text-primary-950'>
              {title}
            </h1>
            <p className='pb-10 text-xl font-medium text-primary-800'>
              {description}
            </p>
            {block.ctaUrl ? (
              <Button
                asChild
                className='h-auto rounded-full bg-primary-950 px-10 py-6 text-[1.125rem] font-bold text-white'
              >
                <Link href={block.ctaUrl}>{ctaLabel}</Link>
              </Button>
            ) : (
              <Button className='h-auto rounded-full bg-primary-950 px-10 py-6 text-[1.125rem] font-bold text-white'>
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className='block lg:hidden'>
        <h1 className='pb-5 text-pretty text-2xl font-bold text-black'>{title}</h1>

        {mobileMedia?.url ? (
          <img
            className='h-[18rem] w-full rounded-[1.25rem] object-cover pb-3'
            src={mobileMedia.url}
            alt={mobileMedia.alt}
          />
        ) : (
          <div className='mb-3 h-[18rem] w-full rounded-[1.25rem] bg-secondary-50' />
        )}

        {block.ctaUrl ? (
          <Button asChild className='h-auto w-full justify-between rounded-[1.25rem] bg-primary-800 p-5'>
            <Link href={block.ctaUrl}>
              <span className='text-base font-bold text-secondary-200'>
                {ctaLabel}
              </span>
              <ArrowRight className='h-7 w-7 text-secondary-200' />
            </Link>
          </Button>
        ) : (
          <Button className='h-auto w-full justify-between rounded-[1.25rem] bg-primary-800 p-5'>
            <span className='text-base font-bold text-secondary-200'>
              {ctaLabel}
            </span>
            <ArrowRight className='h-7 w-7 text-secondary-200' />
          </Button>
        )}
      </div>
    </section>
  );
}
