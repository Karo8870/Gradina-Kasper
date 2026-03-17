import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import { payload } from '@/lib/payload';

export default async function AboutUsPage() {
  const aboutUs = await payload.findGlobal({ slug: 'about-us' });

  return (
    <section className='mt-20 flex w-screen justify-center'>
      <div className='w-full max-w-[64rem] px-6'>
        <h1 className='mb-10 text-4xl font-bold tracking-tight text-primary-900 lg:text-5xl'>
          {aboutUs.title}
        </h1>
        <RichTextRenderer data={aboutUs.content} />
      </div>
    </section>
  );
}
