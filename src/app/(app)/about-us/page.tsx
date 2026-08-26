import { generateGlobalMetadata } from '@/lib/metadataHelper';
import { getPayload } from 'payload';
import config from '@payload-config';
import RenderImage from '@/components/RenderImage';
import { RichText } from '@/components/RichText';

export async function generateMetadata() {
  return generateGlobalMetadata('about-page');
}

export default async function () {
  const payload = await getPayload({ config: config });

  const aboutPage = await payload.findGlobal({
    slug: 'about-page'
  });

  return (
    <article className='pt-24 mx-auto max-w-3xl'>
      <h1 className='text-primary-900 mb-8 text-4xl font-bold tracking-tight md:text-5xl'>
        {aboutPage.title}
      </h1>

      <RenderImage
        src={aboutPage.teamImage}
        className='mb-8 h-auto w-full rounded-2xl object-cover'
      />

      <RichText
        data={aboutPage.description}
        className='prose-p:text-neutral-700 prose-headings:text-primary-900 prose-strong:text-primary-950 !mx-0 !px-0'
      />

      {/* <section className='mx-auto mt-12 max-w-5xl pt-8'>
        <h2 className='text-primary-900 text-3xl font-semibold'>Echipa</h2>

        <ul className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {aboutPage.members.map((member) => {
            return (
              <li
                key={member.id}
                className='overflow-hidden rounded-xl border border-neutral-200 bg-white'
              >
                <RenderImage
                  className='aspect-[4/5] w-full object-cover'
                  src={member.photo}
                />

                <div className='space-y-2 p-4'>
                  <h3 className='text-primary-900 text-lg font-semibold'>
                    {member.name}
                  </h3>
                  <p className='text-sm text-neutral-600'>{member.bio}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section> */}
    </article>
  );
}
