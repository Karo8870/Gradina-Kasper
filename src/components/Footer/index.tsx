import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import RenderImage from '@/components/RenderImage';
import { SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons';

export async function Footer() {
  const payload = await getPayload({ config });

  const footer = await payload.findGlobal({
    slug: 'footer'
  });

  return (
    <footer className='bg-primary-900 mx-6 mt-12 mb-6 flex justify-between rounded-[1.25rem] p-8 max-md:mx-2 max-md:mb-2 max-md:flex-col max-md:gap-12'>
      <div className='flex w-1/5 flex-col items-center justify-center gap-4 max-md:w-full'>
        <RenderImage
          className='h-20 w-auto object-contain md:h-24'
          src={footer.footerImage}
        />
        <p className='text-center text-sm text-white/80'>{footer.slogan}</p>
      </div>
      <div className='flex gap-12 max-md:flex-col'>
        <div className='flex flex-col items-center gap-5'>
          <h3 className='text-xl font-bold text-white max-md:text-base'>
            Social Media
          </h3>
          <div className='flex items-center gap-4'>
            <Link
              href={footer.social.facebookUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Facebook'
              className='text-primary-900 rounded-full bg-white p-2 transition cursor-pointer'
            >
              <SiFacebook className='h-7 w-7' strokeWidth={1.75} />
            </Link>
            <Link
              href={footer.social.instagramUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
              className='text-primary-900 rounded-full bg-white p-2 transition cursor-pointer'
            >
              <SiInstagram className='h-7 w-7' strokeWidth={1.75} />
            </Link>
          </div>
        </div>
        {footer.columns.map((column, index) => (
          <div key={index} className='flex flex-col items-center gap-5'>
            <h3 className='text-xl font-bold text-white max-md:text-base'>
              {column.title}
            </h3>
            <div className='flex flex-col gap-2'>
              {column.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.url}
                  className='text-center text-base text-white/90 max-md:text-sm'
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
