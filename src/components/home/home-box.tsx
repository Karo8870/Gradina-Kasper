import { Button } from '@/components/ui/button';
import Link from 'next/link';

type HomeBoxProps = {
  title?: string;
  description?: string;
  price?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  detailsHref?: string;
};

export function HomeBox({
  title = 'Cutia Kasper',
  description =
    'Legume si fructe proaspete, alese atent pentru tine. Alege frecventa potrivita si adauga rapid in cos.',
  price = '99 lei',
  imageSrc,
  imageAlt = 'Cutie cu legume proaspete',
  detailsHref
}: HomeBoxProps) {
  return (
    <section className='w-full'>
      <div className='border-border bg-card flex w-full flex-col overflow-hidden rounded-[2.5rem] border shadow-sm lg:h-[20rem] lg:flex-row'>
        <div className='bg-secondary-50 relative h-72 w-full lg:h-auto lg:w-1/2'>
          {imageSrc ? detailsHref ? (
            <Link href={detailsHref} className='block h-full w-full'>
              <img
                src={imageSrc}
                alt={imageAlt}
                className='h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]'
              />
            </Link>
          ) : (
            <img src={imageSrc} alt={imageAlt} className='h-full w-full object-cover' />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center text-sm font-medium'>
              Imagine produs
            </div>
          )}
        </div>

        <div className='flex w-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:w-1/2 lg:px-8 lg:py-6'>
          <div className='flex flex-col items-center gap-4 text-center lg:gap-3'>
            <h2 className='text-primary-900 text-3xl font-bold tracking-tight sm:text-4xl lg:text-3xl'>
              {detailsHref ? (
                <Link href={detailsHref} className='hover:underline'>
                  {title}
                </Link>
              ) : (
                title
              )}
            </h2>

            <p className='text-muted-foreground line-clamp-2 max-w-md text-base leading-relaxed sm:text-lg lg:text-sm'>
              {description}
            </p>

            <div className='relative mt-2 w-full max-w-sm'>
              <select
                defaultValue='saptamanal'
                className='border-border bg-background text-foreground h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
              >
                <option value='saptamanal'>Săptămânal</option>
                <option value='la-doua-saptamani'>La două săptămâni</option>
                <option value='achizitie-unica'>Achiziție unică</option>
              </select>
              <span className='text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs'>
                ▼
              </span>
            </div>
          </div>

          <div className='mt-8 flex flex-wrap items-end justify-between gap-4 lg:mt-5'>
            <div className='flex flex-col'>
              <span className='text-primary-900 text-3xl font-bold leading-none lg:text-2xl'>
                {price}
              </span>
              <span className='text-muted-foreground mt-1 text-sm'>
                Preț cu TVA inclus
              </span>
            </div>

            <div className='flex flex-wrap gap-2'>
              {detailsHref ? (
                <Button asChild variant='outline' className='h-12 rounded-full px-6 text-sm'>
                  <Link href={detailsHref}>Vezi detalii</Link>
                </Button>
              ) : null}

              <Button className='h-12 rounded-full bg-primary-900 px-8 text-base font-bold text-white'>
                Adaugă în coș
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
