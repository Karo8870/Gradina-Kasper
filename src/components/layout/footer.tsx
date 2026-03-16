import { payload } from '@/lib/payload';

export async function Footer() {
  const footer = await payload.findGlobal({
    slug: 'footer'
  });

  return (
    <footer className='bg-primary-900 mx-6 mt-12 mb-6 flex justify-between rounded-[1.25rem] p-8 max-md:mx-2 max-md:mb-2 max-md:flex-col max-md:gap-12'>
      <div className='flex w-1/5 flex-col items-center justify-center gap-4 max-md:w-full'>
        <div className='flex items-center justify-center gap-2'>
          <img src='/logo-dark.svg' className='h-8 w-8' alt='logo' />
          <h2 className='text-base font-bold text-white'>Grădina Kasper</h2>
        </div>
        <p className='text-center text-sm text-white/80'>
          {footer.description}
        </p>
      </div>
      <div className='flex gap-12 max-md:flex-col'>
        {footer.columns?.map((column, index) => (
          <div key={index} className='flex flex-col items-center gap-5'>
            <h3 className='text-xl font-bold text-white max-md:text-base'>
              {column.title}
            </h3>
            <div className='flex flex-col gap-2'>
              {column.links?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className='text-center text-base text-white/90 max-md:text-sm'
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
