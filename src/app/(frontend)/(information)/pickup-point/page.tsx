import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import { payload } from '@/lib/payload';
import { Media } from '@/payload-types';

export default async function PickupPointPage() {
  const pickupPoint = await payload.findGlobal({ slug: 'pickup-point' });

  const topImage =
    pickupPoint.topImage && typeof pickupPoint.topImage === 'object'
      ? (pickupPoint.topImage as Media)
      : null;

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        {topImage?.url ? (
          <img
            src={topImage.url}
            alt={topImage.alt}
            className='mb-8 h-[280px] w-full rounded-2xl object-cover md:h-[360px]'
          />
        ) : null}

        <h1 className='mb-8 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          {pickupPoint.title}
        </h1>

        <RichTextRenderer data={pickupPoint.description} />

        <div className='mt-10 rounded-2xl border border-border bg-secondary-50 p-6'>
          <h2 className='text-xl font-semibold text-primary-900'>Location</h2>
          <p className='mt-2 text-base text-primary-900'>
            {pickupPoint.location?.addressLine}
          </p>
          <p className='text-base text-primary-800'>{pickupPoint.location?.city}</p>
          {pickupPoint.location?.mapUrl ? (
            <a
              href={pickupPoint.location.mapUrl}
              target='_blank'
              rel='noreferrer'
              className='mt-3 inline-block text-sm font-semibold text-primary-700 underline underline-offset-4'
            >
              Open in maps
            </a>
          ) : null}
        </div>

        {pickupPoint.openingHours?.length ? (
          <div className='mt-8 rounded-2xl border border-border p-6'>
            <h2 className='text-xl font-semibold text-primary-900'>Opening hours</h2>
            <ul className='mt-4 space-y-2'>
              {pickupPoint.openingHours.map((entry, index) => (
                <li
                  key={index}
                  className='flex items-center justify-between border-b border-border/60 pb-2 text-sm'
                >
                  <span className='font-medium text-primary-900'>{entry.day}</span>
                  <span className='text-primary-700'>{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {pickupPoint.notes ? (
          <p className='mt-6 text-sm leading-relaxed text-muted-foreground'>
            {pickupPoint.notes}
          </p>
        ) : null}
      </div>
    </section>
  );
}
