import { payload } from '@/lib/payload';
import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';

export default async function ({
  params
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const data = await payload.find({
    collection: 'legal-pages',
    where: {
      slug: {
        equals: slug
      }
    },
    limit: 1
  });

  const page = data.docs[0];

  if (!page) {
    return (
      <div className='mt-20 flex w-screen flex-col items-center justify-center'>
        <h1 className='mb-20 text-4xl font-bold tracking-tight text-neutral-900 first:mt-0 lg:text-5xl'>
          Page not found
        </h1>
      </div>
    );
  }

  return (
    <div className='mt-20 flex w-screen flex-col items-center justify-center'>
      <h1 className='mb-20 text-4xl font-bold tracking-tight text-neutral-900 first:mt-0 lg:text-5xl'>
        {page.title}
      </h1>
      <div className='max-w-[64rem] px-6'>
        <RichTextRenderer data={page.content} />
      </div>
    </div>
  );
}
