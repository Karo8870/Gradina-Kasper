import { CmsRichText } from '@/components/content/cms-rich-text';
import { RenderMedia } from '@/components/render-media';
import { getCMS } from '@/lib/cms';
import { generateGlobalMetadata } from '@/lib/generate-metadata';
import type { Media } from '@/payload-types';

export default async function AboutPage() {
  const payload = await getCMS();
  const page = await payload.findGlobal({
    slug: 'about-page',
    depth: 1,
    overrideAccess: false
  });
  const teamImage =
    typeof page.teamImage === 'object' ? (page.teamImage as Media) : null;

  return (
    <article className='mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6'>
      <h1 className='text-4xl font-semibold tracking-tight'>
        {page.title || 'Despre noi'}
      </h1>
      {teamImage ? (
        <RenderMedia
          alt={teamImage.alt || page.title || 'Echipa noastră'}
          className='w-full rounded-2xl object-cover'
          src={teamImage}
        />
      ) : null}
      <CmsRichText data={page.description} />
    </article>
  );
}

export function generateMetadata() {
  return generateGlobalMetadata('about-page', {
    fallbackDescription: 'Află mai multe despre Grădina Kasper.',
    fallbackTitle: 'Despre noi',
    pathname: '/about-us'
  });
}
