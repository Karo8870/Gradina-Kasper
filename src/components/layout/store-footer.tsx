import { SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

import { CookieSettingsLink } from '@/components/cookie-consent';
import { RenderMedia } from '@/components/render-media';
import type { Footer, Media } from '@/payload-types';

export function StoreFooter({ footer }: { footer: Footer }) {
  const footerImage =
    typeof footer.footerImage === 'object'
      ? (footer.footerImage as Media)
      : null;

  return (
    <footer className='mt-12'>
      <div className='mx-2 flex flex-col justify-between gap-12 rounded-[1.25rem] bg-[#005621] p-8 text-white md:mx-6 md:flex-row'>
        <div className='flex w-full flex-col items-center justify-center gap-4 md:w-1/5'>
          {footerImage ? (
            <RenderMedia
              alt={footerImage.alt || 'Grădina Kasper'}
              className='h-20 w-auto object-contain md:h-24'
              src={footerImage}
            />
          ) : null}
          {footer.slogan ? (
            <p className='text-center text-sm text-white/80'>{footer.slogan}</p>
          ) : null}
        </div>

        <div className='flex flex-col gap-12 md:flex-row'>
          <div className='flex flex-col items-center gap-5'>
            <h2 className='text-base font-bold md:text-xl'>Social Media</h2>
            <div className='flex items-center gap-4'>
              {footer.social?.facebookUrl ? (
                <Link
                  aria-label='Facebook'
                  className='rounded-full bg-white p-2 text-[#005621]'
                  href={footer.social.facebookUrl}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <SiFacebook className='size-7' />
                </Link>
              ) : null}
              {footer.social?.instagramUrl ? (
                <Link
                  aria-label='Instagram'
                  className='rounded-full bg-white p-2 text-[#005621]'
                  href={footer.social.instagramUrl}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <SiInstagram className='size-7' />
                </Link>
              ) : null}
            </div>
          </div>

          {(footer.columns ?? []).map((column) => (
            <div
              className='flex flex-col items-center gap-5'
              key={column.id || column.title}
            >
              <h2 className='text-base font-bold md:text-xl'>{column.title}</h2>
              <div className='flex flex-col gap-2'>
                {(column.links ?? []).map((link) =>
                  link.url === 'cookie-settings' ? (
                    <CookieSettingsLink
                      key={link.id || `${column.title}-${link.url}`}
                      label={link.label}
                    />
                  ) : (
                    <Link
                      className='text-center text-sm text-white/90 md:text-base'
                      href={link.url}
                      key={link.id || `${column.title}-${link.url}`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='mx-2 flex flex-wrap items-center justify-center gap-4 bg-white px-8 py-6 md:mx-6 md:justify-start'>
        <Link
          href='https://anpc.ro/sal/'
          rel='noopener noreferrer'
          target='_blank'
        >
          <img
            alt='ANPC SAL — Soluționarea Alternativă a Litigiilor'
            className='h-12 w-auto'
            height={41}
            src='/anpc-sal.svg'
            width={165}
          />
        </Link>
        <Link
          href='https://consumer-redress.ec.europa.eu/index_ro'
          rel='noopener noreferrer'
          target='_blank'
        >
          <img
            alt='ANPC SOL — Soluționarea Online a Litigiilor'
            className='h-12 w-auto'
            height={41}
            src='/anpc-sol.svg'
            width={165}
          />
        </Link>
      </div>
    </footer>
  );
}
