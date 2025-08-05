import Image from 'next/image';
import logoImage from '../../../public/logo-dark.svg';

export function Footer() {
  return (
    <footer className='mx-6 mb-6 mt-12 flex justify-between rounded-[1.25rem] bg-primary-900 p-8 max-md:mx-2 max-md:mb-2 max-md:flex-col max-md:gap-12'>
      <div className='flex w-1/5 flex-col items-center justify-center gap-4 max-md:w-full'>
        <div className='flex items-center justify-center gap-2'>
          <Image src={logoImage} className='h-8 w-8' alt='logo' />
          <h2 className='text-base font-bold text-white'>Grădina Kasper</h2>
        </div>
        <p className='text-center text-sm text-white/80'>
          Lorem ipsum dolor sit amet consectetur. Aliquet cum nisl mattis
          placerat sit. Convallis sit ut consectetur tempus sed et etiam.
        </p>
      </div>
      <div className='flex gap-12 max-md:flex-col'>
        <div className='flex flex-col items-center gap-4'>
          <h3 className='text-xl font-bold text-white max-md:text-base'>
            Social media
          </h3>
          <div className='flex flex-row gap-5'>
            <i className='fab fa-facebook text-3xl text-white/90' />
            <i className='fab fa-instagram text-3xl text-white/90' />
          </div>
        </div>
        <div className='flex flex-col items-center gap-4'>
          <h3 className='text-xl font-bold text-white max-md:text-base'>Legal</h3>
          <div className='flex flex-col gap-2'>
            <a
              href='#'
              className='text-center text-base text-white/90 max-md:text-sm'
            >
              Data security
            </a>
            <a
              href='#'
              className='text-center text-base text-white/90 max-md:text-sm'
            >
              Imprint
            </a>
            <a
              href='#'
              className='text-center text-base text-white/90 max-md:text-sm'
            >
              Right of withdrawal
            </a>
            <a
              href='#'
              className='text-center text-base text-white/90 max-md:text-sm'
            >
              Terms of service
            </a>
          </div>
        </div>
        <div className='flex flex-col items-center gap-4'>
          <h3 className='text-xl font-bold text-white max-md:text-base'>Suport</h3>
          <div className='flex flex-col gap-2'>
            <a
              href='#'
              className='text-center text-sm text-white/90 max-md:text-base'
            >
              FAQ
            </a>
            <a
              href='#'
              className='text-center text-sm text-white/90 max-md:text-base'
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
