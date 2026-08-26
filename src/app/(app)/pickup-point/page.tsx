import config from '@payload-config';
import RenderImage from '@/components/RenderImage';
import Section from '@/components/Section';
import { generateGlobalMetadata } from '@/lib/metadataHelper';
import { getPayload } from 'payload';

export async function generateMetadata() {
  return generateGlobalMetadata('pickup-point-page');
}

export default async function PickupPointPage() {
  const payload = await getPayload({ config });

  const pickup = await payload.findGlobal({
    slug: 'pickup-point-page',
    depth: 1
  });

  return (
    <main className='pt-24 mx-auto max-w-3xl'>
      {pickup.heroImage ? (
        <RenderImage
          className='mb-8 h-auto w-full rounded-2xl object-cover'
          src={pickup.heroImage}
        />
      ) : null}

      <Section
        className='!px-0 !pb-0'
        title={pickup.title}
        description={pickup.description}
      >
        <div>
          <section className='bg-primary-50/40 border-primary-100 mt-8 rounded-2xl border p-6'>
            <h2 className='text-primary-900 text-3xl font-semibold'>
              {pickup.locationTitle}
            </h2>
            <div className='mt-3 space-y-1 text-lg font-medium text-neutral-700'>
              <p>{pickup.locationLine1}</p>
              <p>{pickup.locationLine2}</p>
            </div>
          </section>

          <section className='mt-6 rounded-2xl border border-neutral-200 bg-white p-6'>
            <h2 className='text-primary-900 text-3xl font-semibold'>
              {pickup.openingHoursTitle}
            </h2>

            <ul className='mt-4 divide-y divide-neutral-200'>
              {pickup.openingHours.map((item, index) => (
                <li
                  key={item.id || index}
                  className='flex items-center justify-between gap-4 py-3'
                >
                  <span className='text-neutral-700'>{item.day}</span>
                  <span className='text-primary-800 font-semibold'>
                    {item.hours}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Section>
    </main>
  );
}
