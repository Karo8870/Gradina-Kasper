import { CmsRichText } from '@/components/content/cms-rich-text';
import { RenderMedia } from '@/components/render-media';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';
import type { Media } from '@/payload-types';

export default async function PickupPointPage() {
  const payload = await getCMS();
  const page = await payload.findGlobal({
    slug: 'pickup-point-page',
    depth: 1,
    overrideAccess: false
  });
  const heroImage =
    typeof page.heroImage === 'object' ? (page.heroImage as Media) : null;

  return (
    <div className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      {heroImage ? (
        <RenderMedia
          alt={heroImage.alt || page.title || 'Punct de ridicare'}
          className='w-full rounded-2xl object-cover'
          src={heroImage}
        />
      ) : null}

      <header className='space-y-3'>
        <h1 className='text-4xl font-semibold tracking-tight'>
          {page.title || 'Punct de ridicare'}
        </h1>
        <CmsRichText data={page.description} />
      </header>

      <div className='grid gap-5 sm:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{page.locationTitle || 'Locație'}</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1'>
            {page.locationLine1 ? <p>{page.locationLine1}</p> : null}
            {page.locationLine2 ? <p>{page.locationLine2}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{page.openingHoursTitle || 'Program'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='divide-y'>
              {(page.openingHours ?? []).map((item, index) => (
                <li
                  className='flex justify-between gap-4 py-2'
                  key={item.id || `${item.day}-${index}`}
                >
                  <span className='text-muted-foreground'>{item.day}</span>
                  <span className='font-medium'>{item.hours}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('pickup-point-page', {
    fallbackDescription: 'Locația și programul punctului de ridicare.',
    fallbackTitle: 'Punct de ridicare',
    pathname: '/pickup-point'
  });
}
